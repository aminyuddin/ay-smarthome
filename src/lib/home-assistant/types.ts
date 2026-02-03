/**
 * Home Assistant entity model.
 * Single source of truth: state comes from HA (or mock in demo).
 * Real HA API integration would replace mock-state and service handlers only.
 */

export type HADomain =
  | "light"
  | "switch"
  | "sensor"
  | "binary_sensor"
  | "lock"
  | "climate"
  | "cover"
  | "fan"
  | "alarm_control_panel"
  | "camera";

export interface HAEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export type HAStateStore = Record<string, HAEntityState>;

/** Service call payload – entity_id and optional service data */
export interface HAServiceCall {
  domain: HADomain;
  service: string;
  data?: Record<string, unknown>;
}
