/**
 * Gateway / controller model for the network layer.
 * Examples: Zigbee2MQTT, ZHA, Wi‑Fi router, Matter hub, Bluetooth proxy, virtual/test hub.
 * Only status/metadata are modeled here; real connections would be managed by HA/integrations.
 */

import type { DeviceProtocol } from "./device";

export type GatewayType =
  | "Zigbee2MQTT"
  | "ZHA"
  | "WifiRouter"
  | "MatterBridge"
  | "BluetoothProxy"
  | "VirtualHub";

export type GatewayStatus = "Not Connected" | "Connected" | "Degraded" | "Error";

export interface Gateway {
  id: string;
  name: string;
  /** Software / integration stack label */
  type: GatewayType;
  status: GatewayStatus;
  /** For mesh-style protocols (Zigbee, Matter) */
  coordinatorDetected: boolean;
  devicesPaired: number;
  /** Protocol this gateway handles (zigbee, wifi, matter, bluetooth, virtual) */
  protocol: DeviceProtocol;
  /** Optional connection details for realism only */
  host?: string;
  firmware?: string;
  lastSeen?: string;
}
