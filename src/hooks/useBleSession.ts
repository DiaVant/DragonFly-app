import { useCallback, useRef, useState } from 'react';
import { CMD_START, CMD_STOP } from '../ble/constants';
import { getBleTransport } from '../ble/transport';
import { writeSessionFile } from '../lib/sessionFile';
import type { BleConnectionStatus, DragonflySessionFile } from '../types';

const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;

function emptySessionFile(startedAt: string): DragonflySessionFile {
  return {
    startedAt,
    stoppedAt: null,
    expectedCount: null,
    sampleCount: 0,
    values: [],
    average: null,
    finalScore: null,
  };
}

export function useBleSession() {
  const [connectionStatus, setConnectionStatus] = useState<BleConnectionStatus>('disconnected');
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [values, setValues] = useState<number[]>([]);
  const [expectedCount, setExpectedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const valuesRef = useRef<number[]>([]);
  const expectedCountRef = useRef<number | null>(null);
  const collectingRef = useRef(false);
  const receivingRef = useRef(false);
  const startedAtRef = useRef<string | null>(null);
  const stoppedAtRef = useRef<string | null>(null);

  const finishWithError = useCallback(async (message: string) => {
    const session: DragonflySessionFile = {
      startedAt: startedAtRef.current ?? new Date().toISOString(),
      stoppedAt: stoppedAtRef.current,
      expectedCount: expectedCountRef.current,
      sampleCount: 0,
      values: [],
      average: null,
      finalScore: null,
      error: message,
    };
    try {
      await writeSessionFile(session);
    } catch {
      // Surface the original failure even if we can't persist the error state.
    }
    valuesRef.current = [];
    expectedCountRef.current = null;
    collectingRef.current = false;
    receivingRef.current = false;
    setValues([]);
    setExpectedCount(null);
    setCollecting(false);
    setAwaitingEnd(false);
    setReceiving(false);
    setStarting(false);
    setStopping(false);
    setError(message);
  }, []);

  const finalizeSession = useCallback(async () => {
    if (!collectingRef.current) return;
    const collected = valuesRef.current;
    const expected = expectedCountRef.current;

    if (collected.length === 0) {
      await finishWithError('No values were received from DragonFly 1.0.');
      return;
    }
    if (expected != null && collected.length !== expected) {
      await finishWithError(`Expected ${expected} values from DragonFly 1.0 but received ${collected.length}.`);
      return;
    }

    const sum = collected.reduce((total, value) => total + value, 0);
    const rawAverage = sum / collected.length;
    const average = Number(rawAverage.toFixed(2));
    const score = Math.round(average);

    const session: DragonflySessionFile = {
      startedAt: startedAtRef.current ?? new Date().toISOString(),
      stoppedAt: stoppedAtRef.current,
      expectedCount: expected,
      sampleCount: collected.length,
      values: collected,
      average,
      finalScore: score,
    };

    try {
      await writeSessionFile(session);
    } catch {
      await finishWithError('Failed to save the session file.');
      return;
    }

    collectingRef.current = false;
    setCollecting(false);
    setAwaitingEnd(false);
    setStopping(false);
    setFinalScore(score);
  }, [finishWithError]);

  // Transport-agnostic notification parser — shared by every BleTransport implementation.
  // Transports only hand this already UTF-8-decoded, trimmed text.
  const handleNotificationText = useCallback(
    (text: string) => {
      if (!text) return; // Ignore empty messages.
      if (!collectingRef.current) return; // Ignore stray notifications outside an active session.

      if (text.startsWith('COUNT:')) {
        const n = Number(text.slice('COUNT:'.length).trim());
        if (Number.isInteger(n) && n >= 0) {
          expectedCountRef.current = n;
          setExpectedCount(n);
        }
        return;
      }
      if (text === 'END') {
        finalizeSession();
        return;
      }
      if (text === CMD_START || text === CMD_STOP) {
        return; // Never treat command echoes as numeric values.
      }
      if (!NUMERIC_PATTERN.test(text)) {
        finishWithError(`Received an invalid value from DragonFly 1.0: "${text}".`);
        return;
      }

      const value = Number(text);
      valuesRef.current = [...valuesRef.current, value];
      setValues(valuesRef.current);
      if (!receivingRef.current) {
        receivingRef.current = true;
        setReceiving(true);
      }
    },
    [finalizeSession, finishWithError]
  );

  const handleDisconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    if (collectingRef.current) {
      finishWithError('DragonFly 1.0 disconnected before the session finished.');
    }
  }, [finishWithError]);

  const ensureConnectedAndSubscribed = useCallback(async () => {
    await getBleTransport().connect(handleNotificationText, handleDisconnect);
  }, [handleNotificationText, handleDisconnect]);

  const sendCommand = useCallback(async (command: string) => {
    await getBleTransport().sendCommand(command);
  }, []);

  /** Barebones "setup" connect — pairs with DragonFly and subscribes ahead of time, independent of a fishing session. */
  const connect = useCallback(async (): Promise<boolean> => {
    setConnectError(null);
    setConnecting(true);
    try {
      setConnectionStatus('connecting');
      await ensureConnectedAndSubscribed();
      setConnectionStatus('connected');
      setConnecting(false);
      return true;
    } catch (e) {
      setConnectionStatus('disconnected');
      const message = e instanceof Error ? e.message : 'Could not connect to DragonFly 1.0.';
      setConnectError(message);
      setConnecting(false);
      return false;
    }
  }, [ensureConnectedAndSubscribed]);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStarting(true);
    valuesRef.current = [];
    expectedCountRef.current = null;
    receivingRef.current = false;
    setValues([]);
    setExpectedCount(null);
    setReceiving(false);
    setFinalScore(null);
    setAwaitingEnd(false);

    const startedAt = new Date().toISOString();
    startedAtRef.current = startedAt;
    stoppedAtRef.current = null;

    try {
      await writeSessionFile(emptySessionFile(startedAt));
    } catch {
      setStarting(false);
      setError('Failed to save the session file.');
      return false;
    }

    try {
      setConnectionStatus('connecting');
      await ensureConnectedAndSubscribed();
      setConnectionStatus('connected');
    } catch (e) {
      setConnectionStatus('disconnected');
      const message = e instanceof Error ? e.message : 'Could not connect to DragonFly 1.0.';
      await finishWithError(message);
      return false;
    }

    try {
      await sendCommand(CMD_START);
    } catch {
      await finishWithError('Failed to send the start command to DragonFly 1.0.');
      return false;
    }

    collectingRef.current = true;
    setCollecting(true);
    setStarting(false);
    return true;
  }, [ensureConnectedAndSubscribed, sendCommand, finishWithError]);

  const stop = useCallback(async () => {
    if (!collectingRef.current || awaitingEnd) return;
    setStopping(true);
    const stoppedAt = new Date().toISOString();
    try {
      await sendCommand(CMD_STOP);
    } catch {
      setStopping(false);
      setError('Failed to send the stop command to DragonFly 1.0.');
      return;
    }
    stoppedAtRef.current = stoppedAt;
    setAwaitingEnd(true);
    setStopping(false);
  }, [sendCommand, awaitingEnd]);

  return {
    connectionStatus,
    connecting,
    connectError,
    starting,
    stopping,
    collecting,
    awaitingEnd,
    receiving,
    values,
    expectedCount,
    error,
    finalScore,
    connect,
    start,
    stop,
  };
}

export type BleSessionState = ReturnType<typeof useBleSession>;
