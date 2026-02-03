/**
 * Real Home Assistant connection via WebSocket.
 * Uses home-assistant-js-websocket with long-lived token.
 * Replaces mock state/services when URL + token are configured.
 */

import {
  createLongLivedTokenAuth,
  createConnection,
  subscribeEntities,
  callService as haCallService,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
  ERR_CONNECTION_LOST,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_HTTPS_TO_HTTP,
  ERR_INVALID_AUTH_CALLBACK,
} from "home-assistant-js-websocket";
import type { Connection, HassEntity, HassEntities } from "home-assistant-js-websocket";
import type { HAStateStore, HAEntityState } from "./types";

/** Map HA WebSocket error codes to user-friendly messages. */
function messageForHAError(err: unknown): string {
  const code = typeof err === "number" ? err : (err as { code?: number })?.code;
  switch (code) {
    case ERR_CANNOT_CONNECT:
      return "Could not connect. Check the URL, that Home Assistant is running, and that nothing is blocking the connection (e.g. firewall, wrong port).";
    case ERR_INVALID_AUTH:
      return "Invalid token. Create a new long-lived access token in your Home Assistant profile and try again.";
    case ERR_CONNECTION_LOST:
      return "Connection lost. Reconnecting…";
    case ERR_HASS_HOST_REQUIRED:
      return "Home Assistant URL is required.";
    case ERR_INVALID_HTTPS_TO_HTTP:
      return "This page is secure (HTTPS) but the HA URL is not. Use HTTPS for your Home Assistant URL or open this app over HTTP.";
    case ERR_INVALID_AUTH_CALLBACK:
      return "Authentication callback failed. Try logging in again.";
    default:
      if (err instanceof Error && err.message) return err.message;
      if (typeof err === "string") return err;
      return "Connection failed. Check URL and token.";
  }
}

/** Normalize thrown value (HA code number or Error) to an Error with a friendly message. */
function toFriendlyError(err: unknown): Error {
  if (err instanceof Error) {
    const msg = messageForHAError(err);
    return msg !== err.message ? new Error(msg) : err;
  }
  return new Error(messageForHAError(err));
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

function toHAEntityState(entity: HassEntity): HAEntityState {
  return {
    entity_id: entity.entity_id,
    state: entity.state,
    attributes: (entity.attributes ?? {}) as Record<string, unknown>,
    last_changed: entity.last_changed ?? new Date().toISOString(),
    last_updated: entity.last_updated ?? new Date().toISOString(),
  };
}

function entitiesToStore(entities: HassEntities): HAStateStore {
  const store: HAStateStore = {};
  for (const entityId of Object.keys(entities)) {
    const e = entities[entityId];
    if (e) store[entityId] = toHAEntityState(e);
  }
  return store;
}

let connection: Connection | null = null;
let unsubscribeEntities: (() => void) | null = null;
let status: ConnectionStatus = "disconnected";
let lastError: Error | null = null;
let onStatusChange: ((s: ConnectionStatus, err: Error | null) => void) | null = null;
let onStateChange: ((store: HAStateStore) => void) | null = null;

export function getConnectionStatus(): ConnectionStatus {
  return status;
}

export function getLastError(): Error | null {
  return lastError;
}

export function setRealHACallbacks(
  opts: {
    onState?: (store: HAStateStore) => void;
    onStatus?: (status: ConnectionStatus, err: Error | null) => void;
  }
): void {
  onStateChange = opts.onState ?? null;
  onStatusChange = opts.onStatus ?? null;
}

function setStatus(s: ConnectionStatus, err: Error | null = null): void {
  status = s;
  lastError = err;
  onStatusChange?.(status, lastError);
}

export async function connect(haUrl: string, haToken: string): Promise<void> {
  if (!haUrl?.trim() || !haToken?.trim()) {
    setStatus("disconnected", null);
    return;
  }
  await disconnect();
  setStatus("connecting", null);
  try {
    const url = haUrl.replace(/\/$/, "");
    const auth = createLongLivedTokenAuth(url, haToken.trim());
    connection = await createConnection({ auth });
    connection.addEventListener("ready", () => setStatus("connected", null));
    connection.addEventListener("disconnected", () => setStatus("disconnected", null));
    connection.addEventListener("reconnect-error", () => {
      setStatus("error", new Error("Reconnect failed. Check your token and that Home Assistant is reachable."));
    });
    unsubscribeEntities = subscribeEntities(connection, (entities) => {
      const store = entitiesToStore(entities);
      onStateChange?.(store);
    });
    setStatus("connected", null);
  } catch (err) {
    connection = null;
    unsubscribeEntities = null;
    setStatus("error", toFriendlyError(err));
    throw err;
  }
}

export function disconnect(): Promise<void> {
  if (unsubscribeEntities) {
    unsubscribeEntities();
    unsubscribeEntities = null;
  }
  if (connection) {
    connection.close();
    connection = null;
  }
  setStatus("disconnected", null);
  return Promise.resolve();
}

export async function callService(
  domain: string,
  service: string,
  data: Record<string, unknown> & { entity_id?: string | string[] }
): Promise<void> {
  if (!connection) {
    throw new Error("Not connected to Home Assistant");
  }
  await haCallService(connection, domain, service, data);
}
