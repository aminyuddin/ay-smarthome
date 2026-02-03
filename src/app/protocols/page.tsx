"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import type { DeviceProtocol } from "@/lib/types/device";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
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

export default function ProtocolsPage() {
  const { dashboardDevices } = useHomeAssistant();

  const grouped = PROTOCOL_ORDER.map((protocol) => ({
    protocol,
    devices: dashboardDevices.filter((d) => d.protocol === protocol),
  })).filter((g) => g.devices.length > 0);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Network className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Protocols
          </h1>
          <p className="text-sm text-neutral-500">
            Devices grouped by transport (Zigbee, Wi‑Fi, Matter, Bluetooth,
            Virtual)
          </p>
        </div>
      </div>
      <div className="space-y-10">
        {grouped.map(({ protocol, devices }) => (
          <section key={protocol}>
            <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {PROTOCOL_LABELS[protocol]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

