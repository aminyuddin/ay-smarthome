import type { Gateway } from "@/lib/types/gateway";

/**
 * Gateway / protocol bridge list (demo only).
 * Hardcoded for UI demo. In a real deployment these would be discovered
 * from Home Assistant integrations (ZHA, Zigbee2MQTT, etc.) or config.
 */
export const gateways: Gateway[] = [
  // Zigbee coordinators
  {
    id: "gw_zigbee_1",
    name: "Zigbee Gateway",
    type: "Zigbee2MQTT",
    status: "Connected",
    coordinatorDetected: true,
    devicesPaired: 18,
    protocol: "zigbee",
    host: "tcp://192.168.1.50:1883",
    firmware: "Coordinator v4.0.2",
    lastSeen: new Date().toISOString(),
  },
  {
    id: "gw_zigbee_2",
    name: "Zigbee Hub (ZHA)",
    type: "ZHA",
    status: "Disconnected",
    coordinatorDetected: false,
    devicesPaired: 0,
    protocol: "zigbee",
    host: "usb://ttyUSB0",
  },
  // Wi‑Fi router / LAN
  {
    id: "gw_wifi",
    name: "Home Wi‑Fi Router",
    type: "WifiRouter",
    status: "Connected",
    coordinatorDetected: true,
    devicesPaired: 12,
    protocol: "wifi",
    host: "http://192.168.1.1",
    firmware: "RouterOS 1.2.3",
    lastSeen: new Date().toISOString(),
  },
  // Matter hub
  {
    id: "gw_matter",
    name: "Matter Bridge",
    type: "MatterBridge",
    status: "Degraded",
    coordinatorDetected: true,
    devicesPaired: 3,
    protocol: "matter",
    host: "mdns://matter-bridge.local",
    firmware: "Matter Hub 0.9.0-beta",
  },
  // Bluetooth proxy
  {
    id: "gw_ble",
    name: "Bluetooth Proxy",
    type: "BluetoothProxy",
    status: "Connected",
    coordinatorDetected: true,
    devicesPaired: 4,
    protocol: "bluetooth",
    host: "http://192.168.1.60",
    firmware: "BLE Proxy 2.1.0",
  },
  // Virtual / test hub
  {
    id: "gw_virtual",
    name: "Virtual Integration",
    type: "VirtualHub",
    status: "Connected",
    coordinatorDetected: true,
    devicesPaired: 2,
    protocol: "virtual",
    host: "internal://virtual-hub",
  },
];
