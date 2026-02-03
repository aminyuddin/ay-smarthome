/**
 * Discover gateways / protocol bridges from Home Assistant config entries and device registry.
 * Maps HA integrations (ZHA, Zigbee2MQTT, MQTT, Bluetooth, etc.) to the app's Gateway model.
 */

import type { Connection } from "home-assistant-js-websocket";
import type { Gateway, GatewayType, GatewayStatus } from "@/lib/types/gateway";
import type { DeviceProtocol } from "@/lib/types/device";

/** HA config entry (config_entries/get result item). */
interface HAConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  state?: string;
  source?: string;
  [key: string]: unknown;
}

/** HA device registry entry (config/device_registry/list result item). */
interface HADeviceRegistryEntry {
  id: string;
  config_entries: string[];
  name_by_user?: string | null;
  name?: string | null;
  via_device_id?: string | null;
  [key: string]: unknown;
}

const DOMAIN_TO_GATEWAY: Record<
  string,
  { type: GatewayType; protocol: DeviceProtocol }
> = {
  zha: { type: "ZHA", protocol: "zigbee" },
  zigbee2mqtt: { type: "Zigbee2MQTT", protocol: "zigbee" },
  mqtt: { type: "WifiRouter", protocol: "wifi" },
  bluetooth: { type: "BluetoothProxy", protocol: "bluetooth" },
  matter: { type: "MatterBridge", protocol: "matter" },
  esphome: { type: "WifiRouter", protocol: "wifi" },
  shelly: { type: "WifiRouter", protocol: "wifi" },
  tasmota: { type: "WifiRouter", protocol: "wifi" },
  zwave_js: { type: "VirtualHub", protocol: "virtual" },
  zwave: { type: "VirtualHub", protocol: "virtual" },
  deconz: { type: "VirtualHub", protocol: "zigbee" },
  hue: { type: "VirtualHub", protocol: "wifi" },
  homekit: { type: "VirtualHub", protocol: "virtual" },
  generic: { type: "Other", protocol: "virtual" },
};

function mapConfigEntryState(haState: string | undefined): GatewayStatus {
  switch (haState) {
    case "loaded":
      return "Connected";
    case "failed":
    case "setup_error":
    case "setup_retry":
      return "Error";
    case "not_loaded":
      return "Disconnected";
    default:
      return "Disconnected";
  }
}

function entryToGateway(
  entry: HAConfigEntry,
  devicesCount: number
): Gateway {
  const { type, protocol } =
    DOMAIN_TO_GATEWAY[entry.domain.toLowerCase()] ?? {
      type: "Other" as GatewayType,
      protocol: "virtual" as DeviceProtocol,
    };
  const name = entry.title || `${entry.domain} (${entry.entry_id})`;
  const status = mapConfigEntryState(entry.state);
  return {
    id: `ha_${entry.entry_id}`,
    name,
    type,
    status,
    coordinatorDetected: devicesCount > 0,
    devicesPaired: devicesCount,
    protocol,
    lastSeen: status === "Connected" ? new Date().toISOString() : undefined,
  };
}

/**
 * Fetch config entries and device registry from Home Assistant and map to Gateway[].
 * Returns [] if the WebSocket commands are not available (e.g. older HA) or on error.
 */
export async function discoverGateways(connection: Connection): Promise<Gateway[]> {
  try {
    const [entriesResult, devicesResult] = await Promise.all([
      connection.sendMessagePromise<HAConfigEntry[]>({
        type: "config_entries/get",
      }),
      connection.sendMessagePromise<HADeviceRegistryEntry[]>({
        type: "config/device_registry/list",
      }),
    ]);

    const entries = Array.isArray(entriesResult) ? entriesResult : [];
    const devices = Array.isArray(devicesResult) ? devicesResult : [];

    const deviceCountByEntryId: Record<string, number> = {};
    for (const device of devices) {
      const entryIds = device.config_entries ?? [];
      for (const entryId of entryIds) {
        deviceCountByEntryId[entryId] = (deviceCountByEntryId[entryId] ?? 0) + 1;
      }
    }

    return entries.map((entry) =>
      entryToGateway(entry, deviceCountByEntryId[entry.entry_id] ?? 0)
    );
  } catch {
    return [];
  }
}
