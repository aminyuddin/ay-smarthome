/**
 * Entity IDs and domain constants.
 * Aligns with Home Assistant entity_id format: domain.object_id
 */

import type { HADomain } from "./types";

export const ENTITY_IDS = {
  // light
  light_living_room_ceiling: "light.living_room_ceiling",
  light_living_room_led_strip: "light.living_room_led_strip",
  light_bedroom_bedside: "light.bedroom_bedside",
  light_outdoor_porch: "light.outdoor_porch",
  light_garden: "light.garden_light",
  // switch
  switch_study_plug: "switch.study_plug",
  switch_garage_strip_1: "switch.garage_strip_1",
  switch_garage_strip_2: "switch.garage_strip_2",
  switch_garage_strip_3: "switch.garage_strip_3",
  switch_kitchen_microwave: "switch.kitchen_microwave",
  switch_kitchen_coffee: "switch.kitchen_coffee",
  switch_outdoor_sprinkler: "switch.outdoor_sprinkler",
  switch_outdoor_lights: "switch.outdoor_lights",
  switch_virtual_test: "switch.virtual_test",
  // sensor
  sensor_bathroom_humidity: "sensor.bathroom_humidity",
  sensor_living_room_temperature: "sensor.living_room_temperature",
  sensor_study_power: "sensor.study_plug_power",
  sensor_energy_meter: "sensor.energy_meter_kwh",
  sensor_bluetooth_presence: "sensor.bluetooth_presence",
  sensor_sun_next_dawn: "sensor.sun_next_dawn",
  // binary_sensor
  binary_sensor_door_main: "binary_sensor.door_main",
  binary_sensor_window_living: "binary_sensor.window_living",
  binary_sensor_motion_living: "binary_sensor.motion_living",
  binary_sensor_smoke_kitchen: "binary_sensor.smoke_kitchen",
  binary_sensor_gas_kitchen: "binary_sensor.gas_kitchen",
  binary_sensor_water_leak_bathroom: "binary_sensor.water_leak_bathroom",
  binary_sensor_fridge_door: "binary_sensor.fridge_door",
  // lock
  lock_front_door: "lock.front_door",
  // climate
  climate_living_room_ac: "climate.living_room_ac",
  climate_bathroom_heater: "climate.bathroom_heater",
  // cover
  cover_living_room_curtains: "cover.living_room_curtains",
  cover_study_blinds: "cover.study_blinds",
  // fan
  fan_bedroom: "fan.bedroom_fan",
  // alarm_control_panel
  alarm_control_panel_home: "alarm_control_panel.home",
  // camera (placeholder)
  camera_indoor_living: "camera.indoor_living",
  camera_outdoor_front: "camera.outdoor_front",
  // gate (as cover)
  cover_gate_driveway: "cover.gate_driveway",
  // media_player (demo)
  media_player_living_room: "media_player.living_room",
  media_player_walkman: "media_player.walkman",
  // humidifier (demo)
  humidifier_dehumidifier: "humidifier.dehumidifier",
} as const;

export function getDomain(entityId: string): HADomain | null {
  const domain = entityId.split(".")[0];
  const valid: HADomain[] = [
    "light",
    "switch",
    "sensor",
    "binary_sensor",
    "lock",
    "climate",
    "cover",
    "fan",
    "alarm_control_panel",
    "camera",
    "media_player",
    "humidifier",
  ];
  return valid.includes(domain as HADomain) ? (domain as HADomain) : null;
}
