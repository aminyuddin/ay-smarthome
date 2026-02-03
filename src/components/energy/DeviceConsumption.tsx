"use client";

import type { DeviceConsumption as DeviceConsumptionType } from "@/lib/types/energy";
import type { DeviceProtocol } from "@/lib/types/device";
import { ProtocolBadge } from "@/components/ui/ProtocolBadge";

interface DeviceConsumptionProps {
  items: DeviceConsumptionType[];
}

const PROTOCOL_ORDER: (DeviceConsumptionType["protocol"] | undefined)[] = [
  "zigbee",
  "wifi",
  "matter",
  "other",
];

function groupByProtocol(
  items: DeviceConsumptionType[]
): { protocol: string; items: DeviceConsumptionType[] }[] {
  const groups = new Map<string, DeviceConsumptionType[]>();
  for (const item of items) {
    const p = item.protocol ?? "other";
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(item);
  }
  return PROTOCOL_ORDER.filter((p) => p && groups.has(p)).map((protocol) => ({
    protocol: protocol!,
    items: groups.get(protocol!)!,
  }));
}

export function DeviceConsumption({ items }: DeviceConsumptionProps) {
  const grouped = groupByProtocol(items);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 font-semibold text-neutral-800 dark:text-neutral-200">
        Device consumption
      </h3>
      <div className="space-y-4">
        {grouped.map(({ protocol, items: groupItems }) => (
          <div key={protocol}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {protocol === "zigbee" ? "Zigbee devices" : protocol === "wifi" ? "Wi‑Fi" : protocol === "matter" ? "Matter" : "Other"}
            </p>
            <ul className="space-y-3">
              {groupItems.map((item) => (
                <li key={item.deviceId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {item.deviceName}
                      </p>
                      {item.protocol &&
                        item.protocol !== "other" && (
                          <ProtocolBadge
                            protocol={item.protocol as DeviceProtocol}
                          />
                        )}
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
                    {item.kwh} kWh ({item.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
