/**
 * Automation rule – IF condition THEN actions.
 * Structure supports future MQTT triggers (e.g. subscribe to device state).
 */

export type TriggerType = "time" | "device_state" | "sensor";

export interface TimeTrigger {
  type: "time";
  /** Cron-like or simple "HH:mm" */
  at?: string;
  days?: number[]; // 0–6, Sun–Sat
}

export interface DeviceStateTrigger {
  type: "device_state";
  deviceId: string;
  /** e.g. "on" | "off" | "motion" */
  property: string;
  operator: "eq" | "neq" | "gt" | "lt";
  value: string | number | boolean;
}

export interface SensorTrigger {
  type: "sensor";
  deviceId: string;
  property: string;
  operator: "eq" | "neq" | "gt" | "lt";
  value: string | number | boolean;
}

export type AutomationTrigger =
  | TimeTrigger
  | DeviceStateTrigger
  | SensorTrigger;

export interface DeviceAction {
  deviceId: string;
  /** e.g. "on", "brightness", "temperature" */
  property: string;
  value: string | number | boolean;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  actions: DeviceAction[];
  createdAt: string;
}
