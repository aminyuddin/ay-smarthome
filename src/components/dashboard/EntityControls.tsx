"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { getDomain } from "@/lib/home-assistant/entities";
import type { DashboardDevice } from "@/lib/home-assistant/entity-mapper";
import { ToggleSwitch } from "@/components/controls/ToggleSwitch";
import { SliderControl } from "@/components/controls/SliderControl";
import { ColorPicker } from "@/components/controls/ColorPicker";
import { Lock, Unlock, Shield, ShieldOff } from "lucide-react";

const TOOLTIP = "Controlled via Home Assistant";

interface EntityControlsProps {
  device: DashboardDevice;
  /** Primary entity (or first of multiple) */
  entityId: string;
  /** When device has multiple entities (e.g. power strip), render all */
  allEntityIds?: string[];
}

function formatRelativeTime(iso?: string): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  if (diffMs < 0) return null;
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} d ago`;
}

function hexFromRgb(rgb: number[] | undefined): string {
  if (!rgb || rgb.length < 3) return "#ffffff";
  return (
    "#" +
    rgb
      .slice(0, 3)
      .map((x) => Math.round(Number(x)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbFromHex(hex: string): number[] {
  const m = hex.slice(1).match(/.{2}/g);
  if (!m) return [255, 255, 255];
  return m.map((x) => parseInt(x, 16));
}

export function EntityControls({ device, entityId, allEntityIds }: EntityControlsProps) {
  const { getEntity, callService } = useHomeAssistant();
  const ids = allEntityIds && allEntityIds.length > 0 ? allEntityIds : [entityId];
  const entity = getEntity(entityId);
  if (!entity) return <p className="text-sm text-neutral-500">No entity state</p>;

  const domain = getDomain(entityId);
  const attrs = entity.attributes as Record<string, unknown>;
  const state = entity.state;

  // Multiple switches (e.g. power strip)
  if (ids.length > 1 && domain === "switch") {
    return (
      <div className="space-y-2">
        {ids.map((eid, i) => {
          const e = getEntity(eid);
          if (!e) return null;
          const on = e.state === "on";
          const label = (e.attributes as Record<string, string>)?.friendly_name ?? `Socket ${i + 1}`;
          return (
            <div key={eid} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <ToggleSwitch
                checked={on}
                onChange={(onOff) =>
                  callService("switch", onOff ? "turn_on" : "turn_off", { entity_id: eid })
                }
                title={TOOLTIP}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (domain === "light") {
    const on = state === "on";
    const brightness = (attrs.brightness as number) ?? 255;
    const pct = Math.round((brightness / 255) * 100);
    const rgb = attrs.rgb_color as number[] | undefined;
    const color = rgb ? hexFromRgb(rgb) : "#ffffff";
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
          <ToggleSwitch
            checked={on}
            onChange={(onOff) =>
              callService("light", onOff ? "turn_on" : "turn_off", { entity_id: entityId })
            }
            title={TOOLTIP}
          />
        </div>
        <SliderControl
          label="Brightness"
          value={pct}
          onChange={(v) =>
            callService("light", "turn_on", {
              entity_id: entityId,
              brightness: Math.round((v / 100) * 255),
            })
          }
          title={TOOLTIP}
        />
        {rgb && (
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Color
            </span>
            <ColorPicker
              value={color}
              onChange={(hex) =>
                callService("light", "turn_on", {
                  entity_id: entityId,
                  rgb_color: rgbFromHex(hex),
                })
              }
              title={TOOLTIP}
            />
          </div>
        )}
      </div>
    );
  }

  if (domain === "switch") {
    const on = state === "on";
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
        <ToggleSwitch
          checked={on}
          onChange={(onOff) =>
            callService("switch", onOff ? "turn_on" : "turn_off", { entity_id: entityId })
          }
          title={TOOLTIP}
        />
      </div>
    );
  }

  if (domain === "sensor") {
    const unit = (attrs.unit_of_measurement as string) ?? "";
    const updated = formatRelativeTime(entity.last_changed);
    return (
      <div className="text-sm">
        <span className="text-neutral-500">Value: </span>
        <span className="font-medium">
          {state} {unit}
        </span>
        {updated && (
          <p className="mt-0.5 text-[11px] text-neutral-400">Updated {updated}</p>
        )}
      </div>
    );
  }

  if (domain === "binary_sensor") {
    const value = state === "on";
    const updated = formatRelativeTime(entity.last_changed);
    return (
      <div className="text-sm">
        <span className="text-neutral-500">State: </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            value
              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
          }`}
        >
          {value ? "Active" : "OK"}
        </span>
        {updated && (
          <p className="mt-0.5 text-[11px] text-neutral-400">Updated {updated}</p>
        )}
      </div>
    );
  }

  if (domain === "lock") {
    const locked = state === "locked";
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm">Lock</span>
        <button
          type="button"
          onClick={() =>
            callService("lock", locked ? "unlock" : "lock", { entity_id: entityId })
          }
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          title={TOOLTIP}
        >
          {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          {locked ? "Locked" : "Unlocked"}
        </button>
      </div>
    );
  }

  if (domain === "climate") {
    const temp = (attrs.temperature as number) ?? 22;
    const hvacMode = (attrs.hvac_mode as string) ?? "cool";
    const fanMode = (attrs.fan_mode as string) ?? "medium";
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Mode</span>
          <select
            value={hvacMode}
            onChange={(e) =>
              callService("climate", "set_hvac_mode", {
                entity_id: entityId,
                hvac_mode: e.target.value,
              })
            }
            className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          >
            <option value="cool">Cool</option>
            <option value="heat">Heat</option>
            <option value="off">Off</option>
          </select>
        </div>
        <SliderControl
          label="Temperature"
          value={temp}
          min={16}
          max={30}
          unit="°C"
          onChange={(v) =>
            callService("climate", "set_temperature", {
              entity_id: entityId,
              temperature: v,
            })
          }
          title={TOOLTIP}
        />
        <div>
          <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
            Fan
          </span>
          <div className="flex gap-1">
            {(["low", "medium", "high"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  callService("climate", "set_fan_mode", {
                    entity_id: entityId,
                    fan_mode: mode,
                  })
                }
                className={`rounded px-2 py-1 text-sm capitalize ${
                  fanMode === mode ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (domain === "cover") {
    const position = (attrs.current_position as number) ?? 0;
    return (
      <div className="space-y-3">
        <SliderControl
          label="Position"
          value={position}
          unit="%"
          onChange={(v) =>
            callService("cover", "set_cover_position", {
              entity_id: entityId,
              position: v,
            })
          }
          title={TOOLTIP}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => callService("cover", "open_cover", { entity_id: entityId })}
            className="flex-1 rounded bg-neutral-200 py-1.5 text-sm dark:bg-neutral-700"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => callService("cover", "close_cover", { entity_id: entityId })}
            className="flex-1 rounded bg-neutral-200 py-1.5 text-sm dark:bg-neutral-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (domain === "fan") {
    const on = state === "on";
    const pct = (attrs.percentage as number) ?? 0;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Power</span>
          <ToggleSwitch
            checked={on}
            onChange={(onOff) =>
              callService("fan", onOff ? "turn_on" : "turn_off", {
                entity_id: entityId,
                percentage: onOff ? pct || 66 : 0,
              })
            }
            title={TOOLTIP}
          />
        </div>
        <SliderControl
          label="Speed"
          value={pct}
          unit="%"
          onChange={(v) =>
            callService("fan", "set_percentage", { entity_id: entityId, percentage: v })
          }
          title={TOOLTIP}
        />
      </div>
    );
  }

  if (domain === "alarm_control_panel") {
    const armed = state !== "disarmed";
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm">Arm</span>
        <button
          type="button"
          onClick={() =>
            callService(
              "alarm_control_panel",
              armed ? "alarm_disarm" : "alarm_arm_home",
              { entity_id: entityId }
            )
          }
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            armed ? "bg-amber-600 text-white" : "bg-neutral-200 dark:bg-neutral-700"
          }`}
          title={TOOLTIP}
        >
          {armed ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
          {armed ? "Armed" : "Disarmed"}
        </button>
      </div>
    );
  }

  if (domain === "camera") {
    return (
      <div className="aspect-video w-full rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">
        Camera preview placeholder
      </div>
    );
  }

  return (
    <p className="text-sm text-neutral-500">
      Entity: <span className="font-mono text-xs">{entityId}</span>
    </p>
  );
}
