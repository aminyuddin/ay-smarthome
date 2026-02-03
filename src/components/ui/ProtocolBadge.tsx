"use client";

import type { DeviceProtocol } from "@/lib/types/device";

interface ProtocolBadgeProps {
  protocol: DeviceProtocol;
  className?: string;
}

const PROTOCOL_STYLES: Record<
  DeviceProtocol,
  { label: string; className: string }
> = {
  zigbee: {
    label: "Zigbee",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  wifi: {
    label: "Wi‑Fi",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
  matter: {
    label: "Matter",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  },
  bluetooth: {
    label: "Bluetooth",
    className:
      "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  },
  virtual: {
    label: "Virtual",
    className:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
  },
};

export function ProtocolBadge({ protocol, className = "" }: ProtocolBadgeProps) {
  const { label, className: style } = PROTOCOL_STYLES[protocol];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}
