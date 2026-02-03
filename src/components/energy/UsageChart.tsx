"use client";

import type { DailyUsagePoint } from "@/lib/types/energy";

interface UsageChartProps {
  data: DailyUsagePoint[];
  peakKwh?: number;
}

/** Round up to a nice step for axis (e.g. 12.3 -> 15, 5 -> 5). */
function niceYMax(value: number): number {
  if (value <= 0) return 5;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const norm = value / exp;
  if (norm <= 1) return exp;
  if (norm <= 2) return 2 * exp;
  if (norm <= 5) return 5 * exp;
  return 10 * exp;
}

/** Generate y-axis ticks from 0 to max. */
function yTicks(yMax: number, count = 5): number[] {
  const step = yMax / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round((i * step) * 10) / 10);
}

export function UsageChart({ data, peakKwh = 2 }: UsageChartProps) {
  const maxKwh = Math.max(...data.map((d) => d.kwh), 1);
  const yMax = niceYMax(maxKwh);
  const ticks = yTicks(yMax);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalKwh = data.reduce((sum, d) => sum + d.kwh, 0);
  const avgKwh = data.length ? totalKwh / data.length : 0;
  const chartHeightPx = 280;

  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
          Daily usage (kWh)
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden />
            Daily total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" aria-hidden />
            High peak (instant)
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <div className="flex h-full w-full min-h-[280px]">
          {/* Y-axis */}
          <div
            className="flex flex-col justify-between pr-2 text-right"
            style={{ height: chartHeightPx, minWidth: 28 }}
          >
            {ticks.slice().reverse().map((tick) => (
              <span
                key={tick}
                className="text-[11px] tabular-nums text-neutral-500"
              >
                {tick}
              </span>
            ))}
          </div>
          <div
            className="relative flex flex-1 flex-col"
            style={{ height: chartHeightPx }}
          >
            {/* horizontal grid lines */}
            <div className="pointer-events-none absolute inset-0">
              {ticks.slice(1).map((tick) => (
                <div
                  key={tick}
                  className="absolute left-0 right-0 h-px bg-neutral-100 dark:bg-neutral-800"
                  style={{
                    bottom: `${(tick / yMax) * 100}%`,
                  }}
                />
              ))}
            </div>
            <div
              className="relative z-10 flex flex-1 items-end gap-3 pb-1 pt-1"
              style={{ height: chartHeightPx }}
            >
              {data.map((point) => {
                const date = new Date(point.date);
                const dayLabel = days[date.getDay()];
                const barHeightPx = Math.max((point.kwh / yMax) * chartHeightPx, 4);
                const isPeak = point.peakKwh != null && point.peakKwh >= peakKwh * 0.9;
                const tooltip = point.peakKwh != null
                  ? `${point.date} · ${point.kwh.toFixed(1)} kWh total · Peak ${point.peakKwh.toFixed(1)} kWh`
                  : `${point.date} · ${point.kwh.toFixed(1)} kWh`;
                return (
                  <div
                    key={point.date}
                    className="group flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="relative w-full flex-1 flex flex-col justify-end"
                      style={{ minHeight: chartHeightPx }}
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-200 group-hover:opacity-90 group-hover:ring-2 group-hover:ring-neutral-400/50 group-hover:ring-offset-1 dark:group-hover:ring-neutral-500/50 ${
                          isPeak ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{
                          height: barHeightPx,
                          minHeight: 4,
                        }}
                        title={tooltip}
                        role="img"
                        aria-label={`${dayLabel} ${point.date}: ${point.kwh.toFixed(1)} kWh${point.peakKwh != null ? `, peak ${point.peakKwh.toFixed(1)} kWh` : ""}`}
                      />
                      <span
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium tabular-nums text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]"
                        style={{ bottom: barHeightPx - 2 }}
                      >
                        {point.kwh.toFixed(1)}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-500">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>Average <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{avgKwh.toFixed(1)} kWh/day</strong></span>
        <span>Peak instant <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{peakKwh.toFixed(1)} kWh</strong></span>
      </div>
    </div>
  );
}
