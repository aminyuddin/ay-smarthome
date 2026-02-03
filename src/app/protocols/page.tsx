"use client";

import { useState } from "react";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import type { DeviceProtocol } from "@/lib/types/device";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { FilterButtons } from "@/components/ui/FilterButtons";
import { DeviceSearchInput } from "@/components/ui/DeviceSearchInput";
import { filterDevicesBySearch } from "@/lib/device-search";
import { rooms } from "@/lib/data/rooms";
import { Network } from "lucide-react";

const PROTOCOL_ORDER: DeviceProtocol[] = [
  "zigbee",
  "wifi",
  "matter",
  "bluetooth",
  "virtual",
];

const PROTOCOL_LABELS: Record<DeviceProtocol, string> = {
  zigbee: "Zigbee",
  wifi: "Wi‑Fi",
  matter: "Matter",
  bluetooth: "Bluetooth",
  virtual: "Virtual",
};

const PROTOCOL_OPTIONS = [
  { value: "all", label: "All" },
  ...PROTOCOL_ORDER.map((p) => ({ value: p, label: PROTOCOL_LABELS[p] })),
];

export default function ProtocolsPage() {
  const { dashboardDevices } = useHomeAssistant();
  const [protocolFilter, setProtocolFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const grouped = PROTOCOL_ORDER.map((protocol) => ({
    protocol,
    devices: dashboardDevices.filter((d) => d.protocol === protocol),
  })).filter((g) => g.devices.length > 0);

  const groupsToShow =
    protocolFilter === "all"
      ? grouped
      : grouped.filter((g) => g.protocol === protocolFilter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Protocols
              </h1>
              <p className="text-sm text-neutral-500">
                Devices grouped by transport (Zigbee, Wi‑Fi, Matter, Bluetooth,
                Virtual)
              </p>
            </div>
          </div>
          <FilterButtons
            options={PROTOCOL_OPTIONS}
            value={protocolFilter}
            onChange={setProtocolFilter}
            label="Protocol"
          />
        </div>
        <DeviceSearchInput
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />
      </div>
      <div className="space-y-10">
        {groupsToShow.map(({ protocol, devices }) => {
          const filtered = filterDevicesBySearch(devices, search, rooms);
          if (filtered.length === 0) return null;
          return (
          <section key={protocol}>
            <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {PROTOCOL_LABELS[protocol]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </section>
          );
        })}
      </div>
    </div>
  );
}

