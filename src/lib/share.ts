import { Linking, Platform, Share } from 'react-native';
import type { Catch, FishingTrip } from '../types';
import { fmtElapsed } from './format';
import { gearSummary, type GearConfig } from './gear';
import { APP_NAME, HARDWARE_NAME } from './product';

function catchLine(c: Catch): string {
  const name = c.species || (c.outcome === 'lost' ? 'Lost fish' : 'Catch');
  const bits = [
    name,
    `score ${c.score}`,
    fmtElapsed(c.fightSeconds),
    c.location || null,
    c.weight ? `${c.weight} lb` : null,
  ].filter(Boolean);
  return bits.join(' · ');
}

export function buildCatchShareMessage(catchItem: Catch, gear?: GearConfig | null): string {
  const gearLine =
    gear || (catchItem.rodId && catchItem.lineId)
      ? `Gear: ${gear ? gearSummary(gear) : `${catchItem.rodId} · ${catchItem.lineId}`}`
      : null;
  return [
    `${APP_NAME} catch`,
    catchLine(catchItem),
    gearLine,
    catchItem.coachingSummary,
    `Coached with ${HARDWARE_NAME}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildTripShareMessage(
  trip: FishingTrip,
  catches: Catch[],
  gear?: GearConfig | null
): string {
  const members = trip.catchIds
    .map((id) => catches.find((c) => c.id === id))
    .filter(Boolean) as Catch[];
  const totalSec = members.reduce((s, c) => s + c.fightSeconds, 0);
  const lines = members.map((c, i) => `${i + 1}. ${catchLine(c)}`);
  return [
    trip.title,
    `${trip.location} · ${trip.date}`,
    `${members.length} fights · ${fmtElapsed(totalSec)} on the water`,
    gear ? `Gear: ${gearSummary(gear)}` : null,
    trip.caption,
    ...lines,
    `Shared from ${APP_NAME} · ${HARDWARE_NAME}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export type ShareResult = 'shared' | 'copied' | 'canceled' | 'failed';

async function copyToClipboard(message: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    if (typeof document !== 'undefined') {
      const el = document.createElement('textarea');
      el.value = message;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Share text via native sheet when available; on web falls back to
 * Web Share API, then clipboard copy (Share.share is unreliable in browsers).
 */
export async function shareText(message: string, title = APP_NAME): Promise<ShareResult> {
  // Web Share API (Chrome/Safari mobile + some desktop)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: message });
      return 'shared';
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      if (name === 'AbortError') return 'canceled';
      // fall through to clipboard
    }
  }

  // Native (iOS / Android)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const result = await Share.share(
        Platform.OS === 'ios' ? { message, title } : { message, title }
      );
      if (result.action === Share.dismissedAction) return 'canceled';
      return 'shared';
    } catch {
      /* fall through */
    }
  }

  const copied = await copyToClipboard(message);
  return copied ? 'copied' : 'failed';
}

/** Facebook: open sharer when possible, else copy text for paste. */
export async function shareToFacebook(message: string): Promise<ShareResult> {
  const quote = encodeURIComponent(message.slice(0, 500));
  const url = `https://www.facebook.com/sharer/sharer.php?quote=${quote}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      return 'shared';
    }
  } catch {
    /* fall through */
  }
  // Web: open sharer in a new tab
  if (typeof window !== 'undefined') {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return 'shared';
    } catch {
      /* fall through */
    }
  }
  return shareText(message, 'Share to Facebook');
}
