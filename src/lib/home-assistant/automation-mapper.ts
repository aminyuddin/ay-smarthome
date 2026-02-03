/**
 * Map between app Automation type and Home Assistant automation config.
 */

import type { Automation, AutomationTrigger, DeviceAction } from "@/lib/types/automation";
import type { DashboardDevice } from "./entity-mapper";
import type { HAAutomationConfig, HATrigger, HAAction } from "./automation-api";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 64) || "automation";
}

function entityIdFromDeviceId(deviceId: string, devices: DashboardDevice[]): string | null {
  const dev = devices.find((d) => d.id === deviceId);
  return dev?.entityIds?.[0] ?? null;
}

function deviceIdFromEntityId(entityId: string, devices: DashboardDevice[]): string | null {
  const dev = devices.find((d) => d.entityIds?.includes(entityId));
  return dev?.id ?? null;
}

/** Convert our Automation to HA config for create/update. */
export function automationToHaConfig(
  automation: Automation,
  devices: DashboardDevice[]
): HAAutomationConfig {
  const id = automation.id.startsWith("automation.") ? automation.id.replace("automation.", "") : automation.id.startsWith("auto_") ? slugFromName(automation.name) : automation.id;
  const triggers: HATrigger[] = [];
  if (automation.trigger.type === "time") {
    triggers.push({
      trigger: "time",
      at: automation.trigger.at ?? "08:00",
    });
  } else if (automation.trigger.type === "device_state" || automation.trigger.type === "sensor") {
    const entityId = entityIdFromDeviceId(automation.trigger.deviceId, devices);
    if (entityId) {
      triggers.push({
        trigger: "state",
        entity_id: entityId,
        to: String(automation.trigger.value),
        attribute: automation.trigger.property !== "state" ? automation.trigger.property : undefined,
      });
    }
  }
  if (triggers.length === 0) triggers.push({ trigger: "time", at: "08:00" });

  const actions: HAAction[] = [];
  for (const a of automation.actions) {
    const entityId = entityIdFromDeviceId(a.deviceId, devices);
    if (!entityId) continue;
    const [domain] = entityId.split(".");
    const service = mapPropertyToService(domain, a.property, a.value);
    if (service) {
      actions.push({
        action: "call_service",
        service: `${domain}.${service.service}`,
        target: { entity_id: entityId },
        data: service.data ?? {},
      });
    }
  }

  return {
    id,
    alias: automation.name,
    triggers,
    actions,
  };
}

function mapPropertyToService(
  domain: string,
  property: string,
  value: unknown
): { service: string; data?: Record<string, unknown> } | null {
  if (property === "on" || property === "state") {
    if (value === true || value === "on" || value === "true") return { service: "turn_on" };
    if (value === false || value === "off" || value === "false") return { service: "turn_off" };
  }
  if (property === "brightness" && typeof value === "number") {
    return { service: "turn_on", data: { brightness: Math.round((value / 100) * 255) } };
  }
  if (property === "openPercent" && domain === "cover") {
    return { service: value === 0 ? "close" : "open", data: value !== 0 && value !== 100 ? { position: Number(value) } : {} };
  }
  if (property === "temperature" && domain === "climate") {
    return { service: "set_temperature", data: { temperature: Number(value) } };
  }
  if (property === "armed" && domain === "alarm_control_panel") {
    return { service: value === true ? "alarm_arm_home" : "alarm_disarm", data: {} };
  }
  return { service: "turn_on", data: { [property]: value } };
}

/** Convert HA config to our Automation if mappable; otherwise null. */
export function haConfigToAutomation(
  entityId: string,
  haConfig: HAAutomationConfig,
  devices: DashboardDevice[]
): Automation | null {
  const id = haConfig.id ?? entityId.replace("automation.", "");
  const name = haConfig.alias ?? id;
  const triggers = Array.isArray(haConfig.triggers) ? haConfig.triggers : haConfig.triggers ? [haConfig.triggers] : [];
  const actions = Array.isArray(haConfig.actions) ? haConfig.actions : haConfig.actions ? [haConfig.actions] : [];
  const trigger = mapFirstTrigger(triggers, devices);
  const mappedActions = mapActions(actions, devices);
  if (!trigger || mappedActions.length === 0) return null;

  return {
    id: id.startsWith("automation.") ? id : `automation.${id}`,
    name,
    enabled: true,
    trigger,
    actions: mappedActions,
    createdAt: new Date().toISOString(),
  };
}

function mapFirstTrigger(triggers: HATrigger[], devices: DashboardDevice[]): AutomationTrigger | null {
  const t = triggers[0];
  if (!t) return null;
  const platform = t.trigger ?? t.platform;
  if (platform === "time" && t.at) {
    return { type: "time", at: typeof t.at === "string" ? t.at : "08:00" };
  }
  if (platform === "state" && t.entity_id) {
    const eid = Array.isArray(t.entity_id) ? t.entity_id[0] : t.entity_id;
    const deviceId = deviceIdFromEntityId(eid, devices) ?? eid;
    const raw = t.to ?? t.from ?? "";
    const value = Array.isArray(raw) ? raw[0] ?? "" : raw;
    return {
      type: "device_state",
      deviceId,
      property: (t.attribute as string) ?? "state",
      operator: "eq",
      value,
    };
  }
  return { type: "time", at: "08:00" };
}

function mapActions(actions: HAAction[], devices: DashboardDevice[]): DeviceAction[] {
  const result: DeviceAction[] = [];
  for (const a of actions) {
    const service = (a.service ?? (typeof a.action === "string" && a.action.includes(".") ? a.action : "")) as string;
    if (!service) continue;
    const entityId = Array.isArray(a.target?.entity_id) ? a.target?.entity_id[0] : a.target?.entity_id;
    if (!entityId) continue;
    const deviceId = deviceIdFromEntityId(entityId, devices) ?? entityId;
    const [domain, svc] = service.split(".");
    const { property, value } = mapServiceToProperty(domain, svc, a.data);
    result.push({ deviceId, property, value });
  }
  return result;
}

function mapServiceToProperty(
  domain: string,
  service: string,
  data?: Record<string, unknown>
): { property: string; value: string | number | boolean } {
  if (service === "turn_on") {
    if (data?.brightness != null) return { property: "brightness", value: Math.round((Number(data.brightness) / 255) * 100) };
    return { property: "on", value: true };
  }
  if (service === "turn_off") return { property: "on", value: false };
  if (service === "set_temperature" && data?.temperature != null) return { property: "temperature", value: Number(data.temperature) };
  if (service === "open" || service === "close") return { property: "openPercent", value: service === "open" ? 100 : 0 };
  return { property: "on", value: true };
}

export function automationConfigIdFromOurId(ourId: string, name: string): string {
  if (ourId.startsWith("automation.")) return ourId.replace("automation.", "");
  if (ourId.startsWith("auto_")) return slugFromName(name);
  return ourId;
}
