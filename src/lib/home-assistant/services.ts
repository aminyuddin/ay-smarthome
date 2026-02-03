/**
 * Home Assistant service call simulation.
 * No network calls – only updates mock state store.
 * Real HA integration would replace these with REST/WebSocket API calls.
 */

import type { HAEntityState, HAStateStore } from "./types";
import { getDomain } from "./entities";

const ts = () => new Date().toISOString();

function updateEntity(
  store: HAStateStore,
  entityId: string,
  update: Partial<HAEntityState>
): HAStateStore {
  const current = store[entityId];
  if (!current) return store;
  return {
    ...store,
    [entityId]: {
      ...current,
      ...update,
      last_changed: ts(),
      last_updated: ts(),
    },
  };
}

export function applyServiceCall(
  store: HAStateStore,
  domain: string,
  service: string,
  data: Record<string, unknown> & { entity_id?: string | string[] }
): HAStateStore {
  const raw = data.entity_id;
  const entityIds: string[] = Array.isArray(raw)
    ? (raw.filter((id): id is string => typeof id === "string") as string[])
    : raw
      ? [raw]
      : [];
  if (!entityIds.length) return store;

  let next = store;
  for (const eid of entityIds) {
    const entity = next[eid];
    if (!entity) continue;

    switch (domain) {
      case "light":
        if (service === "turn_on") {
          next = updateEntity(next, eid, {
            state: "on",
            attributes: {
              ...entity.attributes,
              brightness: (data.brightness as number) ?? entity.attributes?.brightness ?? 255,
              rgb_color: (data.rgb_color as number[]) ?? entity.attributes?.rgb_color,
            },
          });
        } else if (service === "turn_off") {
          next = updateEntity(next, eid, { state: "off" });
        }
        break;
      case "switch":
        if (service === "turn_on") {
          next = updateEntity(next, eid, { state: "on" });
        } else if (service === "turn_off" || service === "toggle") {
          const newState = entity.state === "on" ? "off" : "on";
          next = updateEntity(next, eid, { state: newState });
        }
        break;
      case "lock":
        if (service === "lock") next = updateEntity(next, eid, { state: "locked" });
        else if (service === "unlock") next = updateEntity(next, eid, { state: "unlocked" });
        break;
      case "climate":
        if (service === "set_temperature") {
          next = updateEntity(next, eid, {
            attributes: { ...entity.attributes, temperature: data.temperature },
          });
        } else if (service === "set_hvac_mode") {
          next = updateEntity(next, eid, {
            state: data.hvac_mode as string,
            attributes: { ...entity.attributes, hvac_mode: data.hvac_mode },
          });
        } else if (service === "set_fan_mode") {
          next = updateEntity(next, eid, {
            attributes: { ...entity.attributes, fan_mode: data.fan_mode },
          });
        }
        break;
      case "cover":
        if (service === "open_cover") {
          next = updateEntity(next, eid, { state: "open", attributes: { ...entity.attributes, current_position: 100 } });
        } else if (service === "close_cover") {
          next = updateEntity(next, eid, { state: "closed", attributes: { ...entity.attributes, current_position: 0 } });
        } else if (service === "set_cover_position") {
          const pos = (data.position as number) ?? (data.current_position as number) ?? 0;
          next = updateEntity(next, eid, {
            state: pos > 0 ? "open" : "closed",
            attributes: { ...entity.attributes, current_position: pos },
          });
        }
        break;
      case "fan":
        if (service === "turn_on") {
          next = updateEntity(next, eid, {
            state: "on",
            attributes: { ...entity.attributes, percentage: data.percentage ?? entity.attributes?.percentage ?? 100 },
          });
        } else if (service === "turn_off") {
          next = updateEntity(next, eid, { state: "off" });
        } else if (service === "set_percentage") {
          next = updateEntity(next, eid, {
            state: (data.percentage as number) > 0 ? "on" : "off",
            attributes: { ...entity.attributes, percentage: data.percentage },
          });
        }
        break;
      case "alarm_control_panel":
        if (service === "alarm_arm_home") next = updateEntity(next, eid, { state: "armed_home" });
        else if (service === "alarm_disarm") next = updateEntity(next, eid, { state: "disarmed" });
        break;
      case "media_player":
        if (service === "media_play_pause") {
          const newState = entity.state === "playing" ? "paused" : "playing";
          next = updateEntity(next, eid, { state: newState });
        } else if (service === "media_play") next = updateEntity(next, eid, { state: "playing" });
        else if (service === "media_pause") next = updateEntity(next, eid, { state: "paused" });
        break;
      case "humidifier":
        if (service === "turn_on") next = updateEntity(next, eid, { state: "on" });
        else if (service === "turn_off") next = updateEntity(next, eid, { state: "off" });
        else if (service === "set_humidity") {
          next = updateEntity(next, eid, {
            attributes: { ...entity.attributes, humidity: data.humidity },
          });
        }
        break;
      default:
        break;
    }
  }
  return next;
}
