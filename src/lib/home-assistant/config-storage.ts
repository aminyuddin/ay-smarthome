/**
 * Client-only persistence for HA connection config (no backend).
 * URL and token are stored in localStorage so they survive page refresh.
 * The token stays in the browser only; anyone with device access can read it.
 */

const STORAGE_KEY = "smarthome_ha_config";

export interface StoredHAConfig {
  haUrl: string;
  haToken: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadHAConfig(): StoredHAConfig | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "haUrl" in parsed &&
      "haToken" in parsed &&
      typeof (parsed as StoredHAConfig).haUrl === "string" &&
      typeof (parsed as StoredHAConfig).haToken === "string"
    ) {
      return parsed as StoredHAConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveHAConfig(config: StoredHAConfig): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ haUrl: config.haUrl, haToken: config.haToken }));
  } catch {
    // quota exceeded or private mode
  }
}

export function clearHAConfig(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
