"use client";

import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { getDomain } from "@/lib/home-assistant/entities";
import type { DashboardDevice } from "@/lib/home-assistant/entity-mapper";
import { ToggleSwitch } from "@/components/controls/ToggleSwitch";
import { SliderControl } from "@/components/controls/SliderControl";
import { ColorPicker } from "@/components/controls/ColorPicker";
import { CameraPreview } from "@/components/dashboard/CameraPreview";
import { Lock, Unlock, Shield, ShieldOff, Play, Pause } from "lucide-react";

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

/** Detect ISO date/time string (e.g. from sun/date sensors) and format in local time */
function formatSensorValueAsLocalTime(value: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
  const { getEntity, callService, config, connectionStatus } = useHomeAssistant();
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
    const localTime = formatSensorValueAsLocalTime(state);
    const displayValue = localTime ?? `${state} ${unit}`.trim();
    return (
      <div className="text-sm">
        <span className="text-neutral-500">Value: </span>
        <span className="font-medium" title={localTime ? undefined : state} suppressHydrationWarning>
          {displayValue}
        </span>
        {updated && (
          <p className="mt-0.5 text-[11px] text-neutral-400" suppressHydrationWarning>Updated {updated}</p>
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
          <p className="mt-0.5 text-[11px] text-neutral-400" suppressHydrationWarning>Updated {updated}</p>
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

  if (domain === "humidifier") {
    const on = state === "on";
    const currentHumidity = (attrs.current_humidity as number) ?? null;
    const targetHumidity = (attrs.humidity as number) ?? 50;
    const mode = (attrs.mode as string) ?? "";
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
          <ToggleSwitch
            checked={on}
            onChange={(onOff) =>
              callService(
                "humidifier",
                onOff ? "turn_on" : "turn_off",
                { entity_id: entityId }
              )
            }
            title={TOOLTIP}
          />
        </div>
        {currentHumidity != null && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Current: <span className="font-medium">{currentHumidity}%</span>
          </p>
        )}
        <SliderControl
          label="Target humidity"
          value={targetHumidity}
          min={0}
          max={100}
          unit="%"
          onChange={(v) =>
            callService("humidifier", "set_humidity", {
              entity_id: entityId,
              humidity: v,
            })
          }
          title={TOOLTIP}
        />
        {mode && (
          <p className="text-[11px] capitalize text-neutral-400 dark:text-neutral-500">
            Mode: {mode.replace(/_/g, " ")}
          </p>
        )}
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

  if (domain === "media_player") {
    const mediaState = state;
    const isPlaying = mediaState === "playing";
    const mediaTitle = (attrs.media_title as string) ?? "";
    const mediaArtist = (attrs.media_artist as string) ?? "";
    const mediaLine =
      [mediaTitle, mediaArtist].filter(Boolean).join(" · ") || "—";
    return (
      <div className="space-y-2">
        <p className="truncate text-sm text-neutral-600 dark:text-neutral-400" title={mediaLine}>
          {mediaLine}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              callService("media_player", "media_play_pause", { entity_id: entityId })
            }
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <span className="text-xs capitalize text-neutral-500 dark:text-neutral-400">
            {mediaState === "playing"
              ? "Playing"
              : mediaState === "paused"
                ? "Paused"
                : mediaState}
          </span>
        </div>
      </div>
    );
  }

  if (domain === "camera") {
    const canStream =
      connectionStatus === "connected" && config.haUrl?.trim() && config.haToken?.trim();
    return (
      <CameraPreview
        entityId={entityId}
        haUrl={canStream ? config.haUrl : ""}
        haToken={canStream ? config.haToken : ""}
        className="rounded-lg"
      />
    );
  }

  return (
    <p className="text-sm text-neutral-500">
      Entity: <span className="font-mono text-xs">{entityId}</span>
    </p>
  );
}
