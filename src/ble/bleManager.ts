import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

let manager: BleManager | null = null;

/** Lazily creates a single shared BleManager instance. Never construct BleManager directly elsewhere. */
export function getBleManager(): BleManager {
  if (Platform.OS === 'web') {
    throw new Error('Bluetooth is not supported on web.');
  }
  if (!manager) {
    manager = new BleManager();
  }
  return manager;
}
