"use client";

import type { Automation } from "@/lib/types/automation";
import { ToggleSwitch } from "@/components/controls/ToggleSwitch";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { Trash2 } from "lucide-react";

interface AutomationCardProps {
  automation: Automation;
}

function formatTrigger(trigger: Automation["trigger"]): string {
  if (trigger.type === "time") {
    const days = trigger.days?.length
      ? trigger.days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")
      : "Every day";
    return `At ${trigger.at ?? "—"} (${days})`;
  }
  if (trigger.type === "device_state" || trigger.type === "sensor") {
    return `Entity ${trigger.deviceId} ${trigger.property} ${trigger.operator} ${trigger.value}`;
  }
  return "—";
}

export function AutomationCard({
  automation,
  onDelete,
}: AutomationCardProps & { onDelete?: (id: string) => void }) {
  const { updateAutomation, dashboardDevices } = useHomeAssistant();

  const getDeviceName = (deviceId: string) =>
    dashboardDevices.find((d) => d.id === deviceId)?.name ?? deviceId;

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            {automation.name}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Trigger</span>{" "}
            {formatTrigger(automation.trigger)}
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Action (HA Service)</span>{" "}
            {automation.actions
              .map((a) => `${getDeviceName(a.deviceId)}: ${a.property}=${String(a.value)}`)
              .join("; ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={automation.enabled}
            onChange={(enabled) => updateAutomation(automation.id, { enabled })}
            title="Enable or disable this automation"
          />
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(automation.id)}
              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
