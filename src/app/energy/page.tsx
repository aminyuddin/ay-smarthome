"use client";

import { useMemo } from "react";
import {
  generateRandomDailyUsage,
  mockEnergySummary,
} from "@/lib/data/energy";
import { UsageChart } from "@/components/energy/UsageChart";
import { DeviceConsumption } from "@/components/energy/DeviceConsumption";
import { Leaf, Zap } from "lucide-react";

const DAYS = 7;

export default function EnergyPage() {
  const { daily, deviceBreakdown, estimatedMonthlyBill, peakUsageKwh, peakUsageTime } =
    useMemo(() => {
      const daily = generateRandomDailyUsage(DAYS);
      const peakUsageKwh =
        Math.max(...daily.map((d) => d.peakKwh ?? 0), mockEnergySummary.peakUsageKwh);
      return {
        ...mockEnergySummary,
        daily,
        peakUsageKwh,
      };
    }, []);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Leaf className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Energy
          </h1>
          <p className="text-sm text-neutral-500">
            Household energy overview
          </p>
        </div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Estimated monthly bill</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            RM {estimatedMonthlyBill}
          </p>
          <p className="text-xs text-neutral-400">Estimated based on recent usage</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Peak usage</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {peakUsageKwh} kWh
          </p>
          <p className="text-xs text-neutral-400">Peak time: {peakUsageTime ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Last 7 days total</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {daily.reduce((a, d) => a + d.kwh, 0).toFixed(1)} kWh
          </p>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <Zap className="h-8 w-8 text-amber-600" />
          <span className="ml-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            Peak usage indicator
          </span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageChart data={daily} peakKwh={peakUsageKwh} />
        <DeviceConsumption items={deviceBreakdown} />
      </div>
    </div>
  );
}
