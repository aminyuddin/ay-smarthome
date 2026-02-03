export interface DailyUsagePoint {
  date: string; // YYYY-MM-DD
  kwh: number;
  peakKwh?: number;
}

export interface DeviceConsumption {
  deviceId: string;
  deviceName: string;
  kwh: number;
  percent: number;
  /** For UI: group Zigbee vs other */
  protocol?: "zigbee" | "wifi" | "matter" | "other";
}

export interface EnergySummary {
  daily: DailyUsagePoint[];
  deviceBreakdown: DeviceConsumption[];
  estimatedMonthlyBill: number;
  peakUsageKwh: number;
  peakUsageTime?: string;
}
