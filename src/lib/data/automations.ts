import type { Automation } from "@/lib/types/automation";

/** Dashboard device ids (see entity-mapper). Actions map to HA service calls conceptually. */
export const initialAutomations: Automation[] = [
  {
    id: "auto_1",
    name: "Good Morning",
    enabled: true,
    trigger: { type: "time", at: "07:00", days: [1, 2, 3, 4, 5] },
    actions: [
      { deviceId: "bedside_lamp", property: "on", value: true },
      { deviceId: "bedside_lamp", property: "brightness", value: 60 },
      { deviceId: "curtains", property: "openPercent", value: 100 },
      { deviceId: "coffee", property: "on", value: true },
    ],
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "auto_2",
    name: "Leave Home",
    enabled: true,
    trigger: { type: "device_state", deviceId: "front_door_lock", property: "locked", operator: "eq", value: true },
    actions: [
      { deviceId: "ceiling_light", property: "on", value: false },
      { deviceId: "led_strip", property: "on", value: false },
      { deviceId: "living_ac", property: "on", value: false },
      { deviceId: "alarm", property: "armed", value: true },
    ],
    createdAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "auto_3",
    name: "Sleep Mode",
    enabled: true,
    trigger: { type: "time", at: "22:30" },
    actions: [
      { deviceId: "ceiling_light", property: "on", value: false },
      { deviceId: "led_strip", property: "on", value: false },
      { deviceId: "curtains", property: "openPercent", value: 0 },
      { deviceId: "bedside_lamp", property: "on", value: true },
      { deviceId: "bedside_lamp", property: "brightness", value: 20 },
    ],
    createdAt: "2024-01-17T10:00:00Z",
  },
];
