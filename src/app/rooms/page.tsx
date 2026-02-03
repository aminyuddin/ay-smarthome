"use client";

import { useState } from "react";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { rooms } from "@/lib/data/rooms";
import { RoomSection } from "@/components/dashboard/RoomSection";
import { FilterButtons } from "@/components/ui/FilterButtons";
import { DeviceSearchInput } from "@/components/ui/DeviceSearchInput";
import { filterDevicesBySearch } from "@/lib/device-search";
import { LayoutGrid } from "lucide-react";

const ROOM_OPTIONS = [
  { value: "all", label: "All" },
  ...rooms.map((r) => ({ value: r.id, label: r.name })),
];

export default function RoomsPage() {
  const { getDevicesByRoom } = useHomeAssistant();
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const roomsToShow =
    roomFilter === "all"
      ? rooms
      : rooms.filter((r) => r.id === roomFilter);

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <LayoutGrid className="h-8 w-8 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                Rooms
              </h1>
              <p className="break-words text-sm text-neutral-500">
                Devices grouped by room
              </p>
            </div>
          </div>
          <FilterButtons
            options={ROOM_OPTIONS}
            value={roomFilter}
            onChange={setRoomFilter}
            label="Room"
          />
        </div>
        <DeviceSearchInput
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />
      </div>
      <div className="space-y-8">
        {roomsToShow.map((room) => {
          const devices = filterDevicesBySearch(
            getDevicesByRoom(room.id),
            search,
            rooms
          );
          if (devices.length === 0) return null;
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
