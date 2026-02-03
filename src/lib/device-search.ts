import type { DashboardDevice } from "@/lib/home-assistant/entity-mapper";
import type { Room } from "@/lib/types/room";

const CATEGORY_LABELS: Record<string, string> = {
  lighting: "Lighting",
  climate: "Climate",
  power: "Power",
  security: "Security",
  safety: "Safety",
  curtains: "Curtains",
  outdoor: "Outdoor",
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function matches(needle: string, haystack: string): boolean {
  if (!needle) return true;
  return normalize(haystack).includes(normalize(needle));
}

/**
 * Filter devices by search query. Matches device name, entity IDs, room name, and category label.
 */
export function filterDevicesBySearch(
  devices: DashboardDevice[],
  search: string,
  rooms: Room[]
): DashboardDevice[] {
  const q = search.trim();
  if (!q) return devices;

  const roomById = new Map(rooms.map((r) => [r.id, r.name]));

  return devices.filter((device) => {
    if (matches(q, device.name)) return true;
    const roomName = roomById.get(device.roomId) ?? device.roomId;
    if (matches(q, roomName)) return true;
    const categoryLabel = CATEGORY_LABELS[device.category] ?? device.category;
    if (matches(q, categoryLabel)) return true;
    if (device.entityIds.some((eid) => matches(q, eid))) return true;
    return false;
  });
}
