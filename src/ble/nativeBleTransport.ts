import type { Device, Subscription } from 'react-native-ble-plx';
import { getBleManager } from './bleManager';
import { CHARACTERISTIC_UUID, DEVICE_NAME, SCAN_TIMEOUT_MS, SERVICE_UUID } from './constants';
import { decodeNotificationValue, encodeCommand } from './codec';
import { requestAndroidBlePermissions } from './permissions';
import type { BleTransport } from './transport';

let deviceRef: Device | null = null;
let subscriptionRef: Subscription | null = null;
let disconnectSubRef: Subscription | null = null;

function scanAndConnect(): Promise<Device> {
  const manager = getBleManager();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      manager.stopDeviceScan();
      reject(new Error('DragonFly 1.0 not found.'));
    }, SCAN_TIMEOUT_MS);

    manager
      .startDeviceScan(null, null, (scanError, scannedDevice) => {
        if (settled) return;
        if (scanError) {
          settled = true;
          clearTimeout(timeout);
          manager.stopDeviceScan();
          reject(new Error('DragonFly 1.0 not found.'));
          return;
        }
        if (scannedDevice && (scannedDevice.name === DEVICE_NAME || scannedDevice.localName === DEVICE_NAME)) {
          settled = true;
          clearTimeout(timeout);
          manager.stopDeviceScan();
          scannedDevice
            .connect()
            .then(resolve)
            .catch(() => reject(new Error('Could not connect to DragonFly 1.0.')));
        }
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(new Error('DragonFly 1.0 not found.'));
      });
  });
}

export const nativeBleTransport: BleTransport = {
  async connect(onNotification, onDisconnect) {
    const granted = await requestAndroidBlePermissions();
    if (!granted) throw new Error('Bluetooth permission denied.');

    const manager = getBleManager();
    const state = await manager.state();
    if (state === 'PoweredOff') throw new Error('Bluetooth is turned off.');
    if (state === 'Unauthorized') throw new Error('Bluetooth permission denied.');
    if (state === 'Unsupported') throw new Error('Bluetooth low energy is not supported on this device.');

    let device = deviceRef;
    const alreadyConnected = device ? await device.isConnected().catch(() => false) : false;
    if (!device || !alreadyConnected) {
      device = await scanAndConnect();
      deviceRef = device;
      subscriptionRef = null;
      disconnectSubRef = null;
    }

    try {
      await device.discoverAllServicesAndCharacteristics();
    } catch {
      throw new Error('Could not connect to DragonFly 1.0.');
    }

    disconnectSubRef?.remove();
    disconnectSubRef = manager.onDeviceDisconnected(device.id, () => {
      deviceRef = null;
      subscriptionRef = null;
      disconnectSubRef = null;
      onDisconnect();
    });

    if (!subscriptionRef) {
      subscriptionRef = device.monitorCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID, (error, characteristic) => {
        if (error) {
          onDisconnect();
          return;
        }
        const raw = characteristic?.value;
        if (!raw) return;
        try {
          onNotification(decodeNotificationValue(raw));
        } catch {
          // Ignore malformed notification payloads.
        }
      });
    }
  },

  async sendCommand(command) {
    const device = deviceRef;
    if (!device) throw new Error('Not connected to DragonFly 1.0.');
    await device.writeCharacteristicWithResponseForService(SERVICE_UUID, CHARACTERISTIC_UUID, encodeCommand(command));
  },
};
