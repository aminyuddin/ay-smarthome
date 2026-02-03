"use client";

import { useState } from "react";
import type { Automation, AutomationTrigger, DeviceAction } from "@/lib/types/automation";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { Plus, X } from "lucide-react";

const TRIGGER_TYPES: { value: AutomationTrigger["type"]; label: string }[] = [
  { value: "time", label: "Time" },
  { value: "device_state", label: "Entity state" },
  { value: "sensor", label: "Sensor" },
];

export function AutomationRuleEditor({
  onSave,
  onCancel,
}: {
  onSave: (a: Automation) => void;
  onCancel: () => void;
}) {
  const { dashboardDevices, addAutomation } = useHomeAssistant();
  const devices = dashboardDevices;
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<AutomationTrigger["type"]>("time");
  const [triggerAt, setTriggerAt] = useState("08:00");
  const [triggerDeviceId, setTriggerDeviceId] = useState("");
  const [triggerProperty, setTriggerProperty] = useState("on");
  const [triggerOperator, setTriggerOperator] = useState<"eq" | "neq">("eq");
  const [triggerValue, setTriggerValue] = useState("true");
  const [actions, setActions] = useState<DeviceAction[]>([]);
  const [actionDeviceId, setActionDeviceId] = useState("");
  const [actionProperty, setActionProperty] = useState("on");
  const [actionValue, setActionValue] = useState("true");

  const addAction = () => {
    if (!actionDeviceId) return;
    setActions((prev) => [
      ...prev,
      {
        deviceId: actionDeviceId,
        property: actionProperty,
        value:
          actionValue === "true"
            ? true
            : actionValue === "false"
              ? false
              : Number.isFinite(Number(actionValue))
                ? Number(actionValue)
                : actionValue,
      },
    ]);
    setActionDeviceId("");
    setActionProperty("on");
    setActionValue("true");
  };

  const removeAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const buildTrigger = (): AutomationTrigger => {
    if (triggerType === "time") {
      return { type: "time", at: triggerAt };
    }
    if (triggerType === "device_state" || triggerType === "sensor") {
      return {
        type: triggerType,
        deviceId: triggerDeviceId,
        property: triggerProperty,
        operator: triggerOperator,
        value:
          triggerValue === "true"
            ? true
            : triggerValue === "false"
              ? false
              : Number(triggerValue) || triggerValue,
      };
    }
    return { type: "time", at: "08:00" };
  };

  const handleSave = () => {
    const automation: Automation = {
      id: `auto_${Date.now()}`,
      name: name || "New automation",
      enabled: true,
      trigger: buildTrigger(),
      actions,
      createdAt: new Date().toISOString(),
    };
    addAutomation(automation);
    onSave(automation);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-lg font-semibold">New automation</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Good Morning"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">IF (trigger)</label>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTriggerType(value)}
                className={`rounded px-3 py-1.5 text-sm ${
                  triggerType === value
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {triggerType === "time" && (
            <input
              type="time"
              value={triggerAt}
              onChange={(e) => setTriggerAt(e.target.value)}
              className="mt-2 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
          )}
          {(triggerType === "device_state" || triggerType === "sensor") && (
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                value={triggerDeviceId}
                onChange={(e) => setTriggerDeviceId(e.target.value)}
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              >
                <option value="">Select device</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.entityIds[0]})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={triggerProperty}
                onChange={(e) => setTriggerProperty(e.target.value)}
                placeholder="Property"
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              />
              <select
                value={triggerOperator}
                onChange={(e) => setTriggerOperator(e.target.value as "eq" | "neq")}
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              >
                <option value="eq">equals</option>
                <option value="neq">not equals</option>
              </select>
              <input
                type="text"
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                placeholder="Value"
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">THEN (actions)</label>
          <ul className="mb-2 space-y-1">
            {actions.map((a, i) => {
              const dev = devices.find((d) => d.id === a.deviceId);
              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded bg-neutral-100 px-2 py-1 text-sm dark:bg-neutral-800"
                >
                  {dev?.name ?? a.deviceId} → {a.property} = {String(a.value)}
                  <button
                    type="button"
                    onClick={() => removeAction(i)}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <select
              value={actionDeviceId}
              onChange={(e) => setActionDeviceId(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="">Device</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={actionProperty}
              onChange={(e) => setActionProperty(e.target.value)}
              placeholder="Property"
              className="w-24 rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
            <input
              type="text"
              value={actionValue}
              onChange={(e) => setActionValue(e.target.value)}
              placeholder="Value"
              className="w-20 rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
            <button
              type="button"
              onClick={addAction}
              className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-sm text-white"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Save (local only)
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
