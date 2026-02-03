"use client";

import { useState } from "react";
import type { DashboardDevice } from "@/lib/home-assistant/entity-mapper";
import { getPrimaryEntityId } from "@/lib/home-assistant/entity-mapper";
import { getDomain } from "@/lib/home-assistant/entities";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { EntityControls } from "./EntityControls";
import { ProtocolBadge } from "@/components/ui/ProtocolBadge";
import { DomainIcon } from "./DomainIcon";
import { rooms } from "@/lib/data/rooms";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DeviceCardProps {
  device: DashboardDevice;
}

const categoryLabels: Record<DashboardDevice["category"], string> = {
  lighting: "Lighting",
  climate: "Climate",
  power: "Power",
  security: "Security",
  safety: "Safety",
  curtains: "Curtains",
  outdoor: "Outdoor",
};

export function DeviceCard({ device }: DeviceCardProps) {
  const { getGateway, getEntity } = useHomeAssistant();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const room = rooms.find((r) => r.id === device.roomId);
  const roomName = room?.name ?? device.roomId;
  const gateway = getGateway(device.gatewayId);
  const gatewayName = gateway?.name ?? device.gatewayId;
  const primaryEntityId = getPrimaryEntityId(device);
  const entity = getEntity(primaryEntityId);
  const domain = entity ? getDomain(primaryEntityId) : null;

  return (
    <article
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-neutral-800 dark:bg-neutral-900"
      title={device.name}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            <DomainIcon domain={domain} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-100">
              {device.name}
            </h3>
            <p className="text-xs text-neutral-500">
              {categoryLabels[device.category]} · {roomName}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ProtocolBadge protocol={device.protocol} />
        </div>
      </div>
      <p className="mb-1 text-xs text-neutral-400">Home Assistant entity</p>
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded bg-neutral-50 px-2 py-1.5 text-left text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      >
        <span className="font-mono">{primaryEntityId}</span>
        {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {showAdvanced && (
        <div className="mb-3 space-y-1 rounded bg-neutral-50 px-2 py-2 text-xs font-mono text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {device.entityIds.map((eid) => (
            <div key={eid}>{eid}</div>
          ))}
        </div>
      )}
      <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <EntityControls
          device={device}
          entityId={primaryEntityId}
          allEntityIds={device.entityIds.length > 1 ? device.entityIds : undefined}
        />
      </div>
    </article>
  );
}
