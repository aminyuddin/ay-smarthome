/**
 * Device schema – protocol-agnostic UI, capability-based rendering.
 * Architecture: Zigbee Device → Coordinator → Gateway Adapter → API/Event Bus → Web Dashboard.
 * Zigbee integration would plug in at the API/Event Bus layer; this UI never talks to Zigbee directly.
 */

export type DeviceCategory =
  | "lighting"
  | "climate"
  | "power"
  | "appliances"
  | "security"
  | "safety"
  | "curtains"
  | "outdoor";

/** Supported protocols for modeling only; UI stays protocol-agnostic */
export type DeviceProtocol = "zigbee" | "wifi" | "matter" | "bluetooth" | "virtual";

/** Protocol metadata – required for each device. Demo: connected=false, signalStrength/lastSeen fake */
export interface DeviceProtocolMetadata {
  protocol: DeviceProtocol;
  gatewayId: string;
  /** In demo mode always false; real connection would come from API/Event Bus */
  connected: boolean;
  /** Fake in demo (e.g. 0–100 or RSSI); real value from coordinator/gateway */
  signalStrength?: number;
  /** Fake ISO timestamp in demo */
  lastSeen?: string;
}

/** Base device – all devices extend this. Replace mock state with API/Event Bus subscription later. */
export interface BaseDevice {
  id: string;
  name: string;
  type: string;
  roomId: string;
  category: DeviceCategory;
  /** Protocol & gateway metadata for integration modeling */
  protocol: DeviceProtocol;
  gatewayId: string;
  connected: boolean;
  signalStrength?: number;
  lastSeen?: string;
  /** UI-only: show as "online" for demo display; real status would come from gateway/API */
  online: boolean;
}

// ─── Lighting ─────────────────────────────────────────────────────────────
export interface LightingDevice extends BaseDevice {
  category: "lighting";
  type: "ceiling_light" | "led_strip" | "lamp" | "porch_light" | "garden_light";
  state: {
    on: boolean;
    brightness?: number;
    color?: string;
  };
}

// ─── Climate ─────────────────────────────────────────────────────────────
export interface ClimateDevice extends BaseDevice {
  category: "climate";
  type:
    | "air_conditioner"
    | "fan"
    | "heater"
    | "humidity_sensor"
    | "temperature_sensor";
  state: {
    on?: boolean;
    mode?: string;
    temperature?: number;
    fanSpeed?: number | string;
    humidity?: number;
  };
}

// ─── Power & Plugs ───────────────────────────────────────────────────────
export interface PowerDevice extends BaseDevice {
  category: "power";
  type: "smart_plug" | "power_strip" | "energy_meter";
  state: {
    on?: boolean;
    sockets?: { id: string; on: boolean }[];
    powerW?: number;
    energyKwh?: number;
  };
}

// ─── Appliances ───────────────────────────────────────────────────────────
export interface ApplianceDevice extends BaseDevice {
  category: "appliances";
  type:
    | "smart_tv"
    | "refrigerator"
    | "washing_machine"
    | "dryer"
    | "microwave"
    | "coffee_machine";
  state: {
    on?: boolean;
    volume?: number;
    input?: string;
    temp?: number;
    doorOpen?: boolean;
    mode?: string;
    progress?: number;
    running?: boolean;
    strength?: string;
    brewing?: boolean;
  };
}

// ─── Security ─────────────────────────────────────────────────────────────
export interface SecurityDevice extends BaseDevice {
  category: "security";
  type:
    | "door_lock"
    | "door_sensor"
    | "window_sensor"
    | "motion_sensor"
    | "camera"
    | "alarm";
  state: {
    locked?: boolean;
    open?: boolean;
    motion?: boolean;
    armed?: boolean;
    previewUrl?: string;
  };
}

// ─── Safety ───────────────────────────────────────────────────────────────
export interface SafetyDevice extends BaseDevice {
  category: "safety";
  type: "smoke_detector" | "gas_sensor" | "water_leak_sensor";
  state: {
    alarm?: boolean;
    level?: number;
    leak?: boolean;
  };
}

// ─── Curtains & Shades ───────────────────────────────────────────────────
export interface CurtainsDevice extends BaseDevice {
  category: "curtains";
  type: "motorized_curtains" | "blinds";
  state: {
    openPercent?: number;
    open?: boolean;
  };
}

// ─── Outdoor ─────────────────────────────────────────────────────────────
export interface OutdoorDevice extends BaseDevice {
  category: "outdoor";
  type: "sprinkler" | "gate" | "outdoor_light";
  state: {
    on?: boolean;
    schedule?: string;
    open?: boolean;
    brightness?: number;
  };
}

export type Device =
  | LightingDevice
  | ClimateDevice
  | PowerDevice
  | ApplianceDevice
  | SecurityDevice
  | SafetyDevice
  | CurtainsDevice
  | OutdoorDevice;

export function isLighting(d: Device): d is LightingDevice {
  return d.category === "lighting";
}
export function isClimate(d: Device): d is ClimateDevice {
  return d.category === "climate";
}
export function isPower(d: Device): d is PowerDevice {
  return d.category === "power";
}
export function isAppliance(d: Device): d is ApplianceDevice {
  return d.category === "appliances";
}
export function isSecurity(d: Device): d is SecurityDevice {
  return d.category === "security";
}
export function isSafety(d: Device): d is SafetyDevice {
  return d.category === "safety";
}
export function isCurtains(d: Device): d is CurtainsDevice {
  return d.category === "curtains";
}
export function isOutdoor(d: Device): d is OutdoorDevice {
  return d.category === "outdoor";
}
