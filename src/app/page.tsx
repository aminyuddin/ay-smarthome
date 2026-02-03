"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { rooms } from "@/lib/data/rooms";
import { RoomSection } from "@/components/dashboard/RoomSection";
import { LayoutGrid } from "lucide-react";

export default function DashboardPage() {
  const { getDevicesByRoom } = useHomeAssistant();

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <LayoutGrid className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500">
            Overview by room · Entity state from Home Assistant
          </p>
        </div>
      </div>
      <div className="space-y-8">
        {rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            devices={getDevicesByRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
