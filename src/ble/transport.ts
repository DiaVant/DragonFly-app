import { Platform } from 'react-native';
import { nativeBleTransport } from './nativeBleTransport';
import { webBleTransport } from './webBleTransport';

/**
 * Platform-agnostic BLE transport. Handles connection, command writing, notification
 * decoding, and disconnection only — notification parsing, scoring, session state, and
 * storage all live in useBleSession and are shared by every transport.
 */
export interface BleTransport {
  /**
   * Ensures a connection + subscription exist. Idempotent — safe to call on every Start
   * (and from the Home "Connect" button) without opening a new picker/re-subscribing if
   * already connected. `onNotification` receives already UTF-8-decoded, trimmed text for
   * every characteristic update. `onDisconnect` fires if the device drops unexpectedly.
   */
  connect(onNotification: (text: string) => void, onDisconnect: () => void): Promise<void>;
  sendCommand(command: string): Promise<void>;
}

/** Web Bluetooth on web, react-native-ble-plx everywhere else. */
export function getBleTransport(): BleTransport {
  return Platform.OS === 'web' ? webBleTransport : nativeBleTransport;
}
