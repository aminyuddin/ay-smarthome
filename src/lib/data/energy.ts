import type { DailyUsagePoint, EnergySummary } from "@/lib/types/energy";

/** Simple numeric hash of a string (for per-day variation). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Generate random daily usage for the last `days` days with clear day-to-day variation. */
export function generateRandomDailyUsage(days: number): DailyUsagePoint[] {
  const result: DailyUsagePoint[] = [];
  const now = new Date();
  const seed = Date.now().toString(36);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayHash = (hash(dateStr + seed + i) % 1000) / 1000;
    const dayHash2 = (hash(seed + dateStr + i) % 1000) / 1000;
    const base = isWeekend ? 7 : 9;
    const variation = (dayHash - 0.5) * 8;
    const kwh = Math.round((base + variation + (dayHash2 - 0.5) * 2) * 10) / 10;
    const clampedKwh = Math.max(4, Math.min(18, kwh));
    const peakKwh = Math.round((1.2 + dayHash * 1.2) * 10) / 10;
    result.push({ date: dateStr, kwh: clampedKwh, peakKwh });
  }
  return result;
}

export const mockEnergySummary: EnergySummary = {
  daily: [
    { date: "2024-02-01", kwh: 8.2, peakKwh: 1.4 },
    { date: "2024-02-02", kwh: 9.1, peakKwh: 1.6 },
    { date: "2024-02-03", kwh: 7.8, peakKwh: 1.2 },
    { date: "2024-02-04", kwh: 10.2, peakKwh: 1.8 },
    { date: "2024-02-05", kwh: 11.5, peakKwh: 2.0 },
    { date: "2024-02-06", kwh: 9.8, peakKwh: 1.5 },
    { date: "2024-02-07", kwh: 8.5, peakKwh: 1.3 },
  ],
  deviceBreakdown: [
    { deviceId: "ac_living", deviceName: "Air Conditioner", kwh: 45, percent: 28, protocol: "wifi" },
    { deviceId: "refrigerator_kitchen", deviceName: "Refrigerator", kwh: 32, percent: 20, protocol: "matter" },
    { deviceId: "smart_tv_living", deviceName: "Smart TV", kwh: 18, percent: 11, protocol: "wifi" },
    { deviceId: "ceiling_light_living", deviceName: "Ceiling Light (Zigbee)", kwh: 8, percent: 5, protocol: "zigbee" },
    { deviceId: "smart_plug_study", deviceName: "Smart Plug (Zigbee)", kwh: 6, percent: 4, protocol: "zigbee" },
    { deviceId: "heater_bathroom", deviceName: "Heater", kwh: 12, percent: 7, protocol: "zigbee" },
    { deviceId: "other", deviceName: "Other devices", kwh: 31, percent: 25, protocol: "other" },
  ],
  estimatedMonthlyBill: 142,
  peakUsageKwh: 2.0,
  peakUsageTime: "18:30",
};
