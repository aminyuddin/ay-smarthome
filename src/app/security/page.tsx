"use client";

import { useState } from "react";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { DeviceSearchInput } from "@/components/ui/DeviceSearchInput";
import { filterDevicesBySearch } from "@/lib/device-search";
import { rooms } from "@/lib/data/rooms";
import { Shield } from "lucide-react";

export default function SecurityPage() {
  const { getDevicesByCategory } = useHomeAssistant();
  const [search, setSearch] = useState("");
  const securityDevices = filterDevicesBySearch(
    getDevicesByCategory("security"),
    search,
    rooms
  );
  const safetyDevices = filterDevicesBySearch(
    getDevicesByCategory("safety"),
    search,
    rooms
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Security & Safety
              </h1>
              <p className="text-sm text-neutral-500">
                Locks, sensors, cameras, alarm · Home Assistant entities
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
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          Security
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {securityDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          Safety (read-only sensors)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safetyDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>
    </div>
  );
}
