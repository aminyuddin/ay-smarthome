/**
 * Home Assistant automation API: read config via WebSocket, create/update/delete via REST.
 */

import type { Connection } from "home-assistant-js-websocket";
import type { HAStateStore } from "./types";

/** HA automation config (simplified – triggers/actions only for mapping). */
export interface HAAutomationConfig {
  id?: string;
  alias?: string;
  triggers?: HATrigger | HATrigger[];
  actions?: HAAction | HAAction[];
  [key: string]: unknown;
}

export interface HATrigger {
  trigger?: string;
  platform?: string;
  at?: string;
  entity_id?: string | string[];
  from?: string | string[];
  to?: string | string[];
  attribute?: string;
  [key: string]: unknown;
}

export interface HAAction {
  action?: string;
  service?: string;
  target?: { entity_id?: string | string[] };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function getAutomationConfig(
  connection: Connection,
  entityId: string
): Promise<HAAutomationConfig | null> {
  try {
    const result = await connection.sendMessagePromise<{ config: HAAutomationConfig }>({
      type: "automation/config",
      entity_id: entityId,
    });
    return result?.config ?? null;
  } catch {
    return null;
  }
}

export function getAutomationEntityIds(entities: HAStateStore): string[] {
  return Object.keys(entities).filter((id) => id.startsWith("automation."));
}

export async function fetchAllAutomationConfigs(
  connection: Connection,
  entities: HAStateStore
): Promise<{ entityId: string; config: HAAutomationConfig }[]> {
  const entityIds = getAutomationEntityIds(entities);
  const results: { entityId: string; config: HAAutomationConfig }[] = [];
  for (const entityId of entityIds) {
    const config = await getAutomationConfig(connection, entityId);
    if (config) results.push({ entityId, config });
  }
  return results;
}

export async function createOrUpdateAutomation(
  baseUrl: string,
  token: string,
  id: string,
  config: HAAutomationConfig
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/config/automation/config/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to save automation: ${res.status}`);
  }
}

export async function deleteAutomation(
  baseUrl: string,
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/config/automation/config/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete automation: ${res.status}`);
  }
}
