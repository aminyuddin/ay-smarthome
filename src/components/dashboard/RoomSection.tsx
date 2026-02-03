"use client";

import type { DashboardDevice } from "@/lib/home-assistant/entity-mapper";
import type { Room } from "@/lib/types/room";
import { DeviceCard } from "./DeviceCard";

interface RoomSectionProps {
  room: Room;
  devices: DashboardDevice[];
  defaultExpanded?: boolean;
}

export function RoomSection({
  room,
  devices,
  defaultExpanded = true,
}: RoomSectionProps) {
  if (devices.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {room.name}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </section>
  );
}
