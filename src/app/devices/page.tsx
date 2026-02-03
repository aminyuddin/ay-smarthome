"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import type { DashboardDeviceCategory } from "@/lib/home-assistant/entity-mapper";
import { Cpu } from "lucide-react";

const CATEGORY_LABELS: Record<DashboardDeviceCategory, string> = {
  lighting: "Lighting",
  climate: "Climate",
  power: "Power & Plugs",
  security: "Security",
  safety: "Safety",
  curtains: "Curtains & Shades",
  outdoor: "Outdoor",
};

const CATEGORY_ORDER: DashboardDeviceCategory[] = [
  "lighting",
  "climate",
  "power",
  "security",
  "safety",
  "curtains",
  "outdoor",
];

export default function DevicesPage() {
  const { getDevicesByCategory } = useHomeAssistant();

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Cpu className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Devices
          </h1>
          <p className="text-sm text-neutral-500">
            By category · Home Assistant entities
          </p>
        </div>
      </div>
      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const devices = getDevicesByCategory(category);
          if (devices.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {devices.map((device) => (
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
