/**
 * Device mapping layer: DashboardDevice → Home Assistant entity/entities.
 * UI cards map to one or more HA entities; rendering is driven by entity domain.
 */

import type { DeviceProtocol } from "@/lib/types/device";
import { ENTITY_IDS } from "./entities";

export type DashboardDeviceCategory =
  | "lighting"
  | "climate"
  | "power"
  | "security"
  | "safety"
  | "curtains"
  | "outdoor";

export interface DashboardDevice {
  id: string;
  name: string;
  /** Primary entity for this card (controls and state) */
  entityIds: string[];
  roomId: string;
  category: DashboardDeviceCategory;
  protocol: DeviceProtocol;
  gatewayId: string;
  /** Optional: secondary entities (e.g. power sensor next to switch) */
  secondaryEntityIds?: string[];
}

const GW = "gw_zigbee_1";
const GW2 = "gw_zigbee_2";
const GW_WIFI = "gw_wifi";

export const dashboardDevices: DashboardDevice[] = [
  // Light
  { id: "ceiling_light", name: "Living Room Ceiling Light", entityIds: [ENTITY_IDS.light_living_room_ceiling], roomId: "living_room", category: "lighting", protocol: "zigbee", gatewayId: GW },
  { id: "led_strip", name: "LED Strip", entityIds: [ENTITY_IDS.light_living_room_led_strip], roomId: "living_room", category: "lighting", protocol: "zigbee", gatewayId: GW },
  { id: "bedside_lamp", name: "Bedside Lamp", entityIds: [ENTITY_IDS.light_bedroom_bedside], roomId: "bedroom", category: "lighting", protocol: "zigbee", gatewayId: GW },
  { id: "porch_light", name: "Porch Light", entityIds: [ENTITY_IDS.light_outdoor_porch], roomId: "outdoor", category: "lighting", protocol: "zigbee", gatewayId: GW },
  { id: "garden_light", name: "Garden Light", entityIds: [ENTITY_IDS.light_garden], roomId: "outdoor", category: "lighting", protocol: "zigbee", gatewayId: GW },
  // Switch / Power
  { id: "study_plug", name: "Smart Plug", entityIds: [ENTITY_IDS.switch_study_plug], roomId: "study_room", category: "power", protocol: "zigbee", gatewayId: GW, secondaryEntityIds: [ENTITY_IDS.sensor_study_power] },
  { id: "garage_strip", name: "Power Strip", entityIds: [ENTITY_IDS.switch_garage_strip_1, ENTITY_IDS.switch_garage_strip_2, ENTITY_IDS.switch_garage_strip_3], roomId: "garage", category: "power", protocol: "zigbee", gatewayId: GW2 },
  { id: "microwave", name: "Microwave", entityIds: [ENTITY_IDS.switch_kitchen_microwave], roomId: "kitchen", category: "power", protocol: "zigbee", gatewayId: GW },
  { id: "coffee", name: "Coffee Machine", entityIds: [ENTITY_IDS.switch_kitchen_coffee], roomId: "kitchen", category: "power", protocol: "wifi", gatewayId: GW_WIFI },
  { id: "sprinkler", name: "Smart Sprinkler", entityIds: [ENTITY_IDS.switch_outdoor_sprinkler], roomId: "outdoor", category: "outdoor", protocol: "zigbee", gatewayId: GW },
  { id: "outdoor_lights", name: "Outdoor Lights", entityIds: [ENTITY_IDS.switch_outdoor_lights], roomId: "outdoor", category: "outdoor", protocol: "zigbee", gatewayId: GW },
  // Sensor
  { id: "humidity_sensor", name: "Humidity Sensor", entityIds: [ENTITY_IDS.sensor_bathroom_humidity], roomId: "bathroom", category: "climate", protocol: "zigbee", gatewayId: GW },
  { id: "temp_sensor", name: "Temperature Sensor", entityIds: [ENTITY_IDS.sensor_living_room_temperature], roomId: "living_room", category: "climate", protocol: "zigbee", gatewayId: GW },
  { id: "energy_meter", name: "Energy Meter", entityIds: [ENTITY_IDS.sensor_energy_meter], roomId: "living_room", category: "power", protocol: "zigbee", gatewayId: GW },
  { id: "bluetooth_presence", name: "Phone Presence", entityIds: [ENTITY_IDS.sensor_bluetooth_presence], roomId: "living_room", category: "security", protocol: "bluetooth", gatewayId: GW_WIFI },
  { id: "virtual_switch", name: "Virtual Test Switch", entityIds: [ENTITY_IDS.switch_virtual_test], roomId: "study_room", category: "power", protocol: "virtual", gatewayId: GW_WIFI },
  // Binary sensor
  { id: "door_sensor", name: "Door Sensor", entityIds: [ENTITY_IDS.binary_sensor_door_main], roomId: "living_room", category: "security", protocol: "zigbee", gatewayId: GW },
  { id: "window_sensor", name: "Window Sensor", entityIds: [ENTITY_IDS.binary_sensor_window_living], roomId: "living_room", category: "security", protocol: "zigbee", gatewayId: GW },
  { id: "motion_sensor", name: "Motion Sensor", entityIds: [ENTITY_IDS.binary_sensor_motion_living], roomId: "living_room", category: "security", protocol: "zigbee", gatewayId: GW },
  { id: "smoke_detector", name: "Smoke Detector", entityIds: [ENTITY_IDS.binary_sensor_smoke_kitchen], roomId: "kitchen", category: "safety", protocol: "zigbee", gatewayId: GW },
  { id: "gas_sensor", name: "Gas Leak Sensor", entityIds: [ENTITY_IDS.binary_sensor_gas_kitchen], roomId: "kitchen", category: "safety", protocol: "zigbee", gatewayId: GW },
  { id: "water_leak", name: "Water Leak Sensor", entityIds: [ENTITY_IDS.binary_sensor_water_leak_bathroom], roomId: "bathroom", category: "safety", protocol: "zigbee", gatewayId: GW },
  { id: "fridge_door", name: "Fridge Door", entityIds: [ENTITY_IDS.binary_sensor_fridge_door], roomId: "kitchen", category: "safety", protocol: "matter", gatewayId: "gw_matter" },
  // Lock
  { id: "front_door_lock", name: "Front Door Lock", entityIds: [ENTITY_IDS.lock_front_door], roomId: "living_room", category: "security", protocol: "zigbee", gatewayId: GW },
  // Climate
  { id: "living_ac", name: "Air Conditioner", entityIds: [ENTITY_IDS.climate_living_room_ac], roomId: "living_room", category: "climate", protocol: "wifi", gatewayId: GW_WIFI },
  { id: "bathroom_heater", name: "Heater", entityIds: [ENTITY_IDS.climate_bathroom_heater], roomId: "bathroom", category: "climate", protocol: "zigbee", gatewayId: GW },
  // Cover
  { id: "curtains", name: "Motorized Curtain", entityIds: [ENTITY_IDS.cover_living_room_curtains], roomId: "living_room", category: "curtains", protocol: "zigbee", gatewayId: GW },
  { id: "blinds", name: "Window Blinds", entityIds: [ENTITY_IDS.cover_study_blinds], roomId: "study_room", category: "curtains", protocol: "zigbee", gatewayId: GW2 },
  { id: "gate", name: "Gate Controller", entityIds: [ENTITY_IDS.cover_gate_driveway], roomId: "outdoor", category: "outdoor", protocol: "wifi", gatewayId: GW_WIFI },
  // Fan
  { id: "bedroom_fan", name: "Smart Fan", entityIds: [ENTITY_IDS.fan_bedroom], roomId: "bedroom", category: "climate", protocol: "zigbee", gatewayId: GW },
  // Alarm
  { id: "alarm", name: "Alarm System", entityIds: [ENTITY_IDS.alarm_control_panel_home], roomId: "living_room", category: "security", protocol: "zigbee", gatewayId: GW },
  // Camera (placeholder)
  { id: "camera_indoor", name: "Indoor Camera", entityIds: [ENTITY_IDS.camera_indoor_living], roomId: "living_room", category: "security", protocol: "wifi", gatewayId: GW_WIFI },
  { id: "camera_outdoor", name: "Outdoor Camera", entityIds: [ENTITY_IDS.camera_outdoor_front], roomId: "outdoor", category: "security", protocol: "wifi", gatewayId: GW_WIFI },
];

export function getDashboardDeviceByEntityId(entityId: string): DashboardDevice | undefined {
  return dashboardDevices.find((d) => d.entityIds.includes(entityId));
}

export function getPrimaryEntityId(device: DashboardDevice): string {
  return device.entityIds[0];
}
