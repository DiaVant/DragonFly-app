import { Buffer } from 'buffer';

export function encodeCommand(command: string): string {
  return Buffer.from(command, 'utf8').toString('base64');
}

export function decodeNotificationValue(base64Value: string): string {
  return Buffer.from(base64Value, 'base64').toString('utf8').trim();
}
