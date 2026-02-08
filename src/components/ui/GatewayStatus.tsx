"use client";

import type { Gateway } from "@/lib/types/gateway";
import { Radio, Wifi, Bluetooth, Share2, Cloud } from "lucide-react";
import { ProtocolBadge } from "./ProtocolBadge";

interface GatewayStatusProps {
  gateway: Gateway;
}

function GatewayIcon({ protocol }: { protocol: Gateway["protocol"] }) {
  switch (protocol) {
    case "zigbee":
      return <Radio className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case "wifi":
      return <Wifi className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
    case "matter":
      return <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case "bluetooth":
      return <Bluetooth className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
    case "virtual":
    default:
      return <Cloud className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />;
  }
}

export function GatewayStatus({ gateway }: GatewayStatusProps) {
  const statusColor =
    gateway.status === "Connected"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : gateway.status === "Degraded"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : gateway.status === "Error"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <GatewayIcon protocol={gateway.protocol} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {gateway.name}
            </h3>
            <p className="text-xs text-neutral-500">{gateway.type}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ProtocolBadge protocol={gateway.protocol} />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
          >
            {gateway.status}
          </span>
        </div>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Coordinator</dt>
          <dd className="font-medium">
            {gateway.coordinatorDetected ? "Detected" : "Not detected"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Devices</dt>
          <dd className="font-medium">{gateway.devicesPaired}</dd>
        </div>
        {gateway.host && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">Endpoint</dt>
            <dd className="truncate pl-4 text-xs font-mono text-neutral-600 dark:text-neutral-300">
              {gateway.host}
            </dd>
          </div>
        )}
        {gateway.firmware && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">Firmware</dt>
            <dd className="font-medium text-neutral-700 dark:text-neutral-200">
              {gateway.firmware}
            </dd>
          </div>
        )}
      </dl>
      {gateway.lastSeen && (
        <p className="mt-3 text-xs text-neutral-400" suppressHydrationWarning>
          Last seen: {new Date(gateway.lastSeen).toLocaleString()}
        </p>
      )}
    </article>
  );
}
