"use client";

import { useState } from "react";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { rooms } from "@/lib/data/rooms";
import { RoomSection } from "@/components/dashboard/RoomSection";
import { DeviceSearchInput } from "@/components/ui/DeviceSearchInput";
import { filterDevicesBySearch } from "@/lib/device-search";
import { LayoutGrid } from "lucide-react";

export default function DashboardPage() {
  const { getDevicesByRoom } = useHomeAssistant();
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Dashboard
              </h1>
              <p className="text-sm text-neutral-500">
                Overview by room · Entity state from Home Assistant
              </p>
            </div>
          </div>
        </div>
        <DeviceSearchInput
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />
      </div>
      <div className="space-y-8">
        {rooms.map((room) => {
          const devices = filterDevicesBySearch(
            getDevicesByRoom(room.id),
            search,
            rooms
          );
          return (
            <RoomSection
              key={room.id}
              room={room}
              devices={devices}
            />
          );
        })}
      </div>
    </div>
  );
}
