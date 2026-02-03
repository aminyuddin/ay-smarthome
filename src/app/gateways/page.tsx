"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { GatewayStatus } from "@/components/ui/GatewayStatus";
import { Radio } from "lucide-react";

export default function GatewaysPage() {
  const { gateways, connectionStatus, gatewaysFromHA } = useHomeAssistant();

  const subtitle =
    gatewaysFromHA
      ? "Discovered from Home Assistant."
      : connectionStatus === "connected"
        ? "Could not load gateways from Home Assistant. Showing sample data."
        : "Sample data for demo; connect Home Assistant in Settings to see your integrations.";

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Radio className="h-8 w-8 text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Gateways
          </h1>
          <p className="text-sm text-neutral-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gateways.map((gateway) => (
          <GatewayStatus key={gateway.id} gateway={gateway} />
        ))}
      </div>
    </div>
  );
}
