import { CHARACTERISTIC_UUID, SERVICE_UUID } from './constants';
import type { BleTransport } from './transport';

let device: BluetoothDevice | null = null;
let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
let notifying = false;
let notificationHandler: ((text: string) => void) | null = null;
let disconnectHandler: (() => void) | null = null;

function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
}

function handleCharacteristicValueChanged(event: Event) {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const value = target.value;
  if (!value) return;
  // Web Bluetooth exchanges raw bytes directly — no Base64 hop, unlike the native transport.
  const text = new TextDecoder('utf-8').decode(value.buffer).trim();
  if (text) notificationHandler?.(text);
}

function handleGattDisconnected() {
  characteristic = null;
  notifying = false;
  disconnectHandler?.();
}

export const webBleTransport: BleTransport = {
  async connect(onNotification, onDisconnect) {
    if (!isWebBluetoothAvailable()) {
      throw new Error('Web Bluetooth is not available in this browser. Use Chrome or Edge on localhost or HTTPS.');
    }
    notificationHandler = onNotification;
    disconnectHandler = onDisconnect;

    const alreadyConnected = Boolean(device?.gatt?.connected);
    if (!device || !alreadyConnected) {
      try {
        // Must be called directly from a user gesture (the Start / Connect button click) —
        // never from an effect, timeout, or automatic scan.
        device = await navigator.bluetooth!.requestDevice({
          filters: [{ services: [SERVICE_UUID] }],
        });
      } catch {
        throw new Error('DragonFly 1.0 not found.');
      }
      device.addEventListener('gattserverdisconnected', handleGattDisconnected);
    }

    let service: BluetoothRemoteGATTService;
    try {
      const server = await device.gatt!.connect();
      service = await server.getPrimaryService(SERVICE_UUID);
      characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
    } catch {
      throw new Error('Could not connect to DragonFly 1.0.');
    }

    if (!notifying) {
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      await characteristic.startNotifications();
      notifying = true;
    }
  },

  async sendCommand(command) {
    if (!characteristic) throw new Error('Not connected to DragonFly 1.0.');
    const bytes = new TextEncoder().encode(command);
    await characteristic.writeValue(bytes);
  },
};
