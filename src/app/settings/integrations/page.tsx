"use client";

import Link from "next/link";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { GatewayStatus } from "@/components/ui/GatewayStatus";
import { Server, Radio, Link2 } from "lucide-react";

function connectionStatusLabel(
  status: "disconnected" | "connecting" | "connected" | "error"
): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "error":
      return "Error";
    default:
      return "Disconnected";
  }
}

export default function IntegrationsPage() {
  const { gateways, gatewaysFromHA, entities, config, connectionStatus, connectionError } = useHomeAssistant();
  const entityCount = Object.keys(entities).length;
  const hasUrlAndToken = config.haUrl?.trim() && config.haToken?.trim();

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Link2 className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Integrations
          </h1>
          <p className="text-sm text-neutral-500">
            Home Assistant & Zigbee
          </p>
        </div>
      </div>

      {/* Home Assistant */}
      <section className="mb-10 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Server className="h-5 w-5" />
          Home Assistant
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-neutral-500">Connection Status</dt>
            <dd className="font-medium">
              {hasUrlAndToken
                ? connectionStatusLabel(connectionStatus)
                : "Not configured"}
              {connectionStatus === "error" && connectionError?.message && (
                <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400" title={connectionError.message}>
                  {connectionError.message.slice(0, 60)}
                  {connectionError.message.length > 60 ? "…" : ""}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-neutral-500">API Type</dt>
            <dd className="font-medium">WebSocket</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-neutral-500">URL</dt>
            <dd className="font-mono text-sm break-all">{config.haUrl || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-neutral-500">Token</dt>
            <dd className="font-medium">
              {config.haTokenConfigured ? "Configured" : "Not configured"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-neutral-500">Entity Count</dt>
            <dd className="font-medium">{entityCount}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-neutral-500">
          <Link href="/settings" className="text-emerald-600 underline dark:text-emerald-400">
            Edit connection (URL & token) in Settings
          </Link>
        </p>
      </section>

      {/* Gateways / protocol bridges (from HA when discovered, else sample data) */}
      <section>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <Radio className="h-5 w-5" />
          Gateways & protocol bridges
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          {gatewaysFromHA
            ? "Discovered from Home Assistant."
            : connectionStatus === "connected"
              ? "Could not load gateways from Home Assistant. Showing sample data."
              : "Sample data for demo. Connect Home Assistant above to see your integrations."}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gateways.map((gateway) => (
            <GatewayStatus key={gateway.id} gateway={gateway} />
          ))}
        </div>
      </section>
    </div>
  );
}
