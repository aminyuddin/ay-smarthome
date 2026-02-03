"use client";

import type { Device } from "@/lib/types/device";
import {
  isLighting,
  isClimate,
  isPower,
  isAppliance,
  isSecurity,
  isSafety,
  isCurtains,
  isOutdoor,
} from "@/lib/types/device";
import { ToggleSwitch } from "@/components/controls/ToggleSwitch";
import { SliderControl } from "@/components/controls/SliderControl";
import { ColorPicker } from "@/components/controls/ColorPicker";
import { useDeviceState } from "@/lib/context/DeviceStateContext";
import { Lock, Unlock, Shield, ShieldOff, Play, Pause } from "lucide-react";

const TOOLTIP = "Controlled via gateway";

interface DeviceControlsProps {
  device: Device;
}

export function DeviceControls({ device }: DeviceControlsProps) {
  const { updateDevice } = useDeviceState();

  if (isLighting(device)) {
    const s = device.state;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
          <ToggleSwitch
            checked={s.on}
            onChange={(on) => updateDevice(device.id, { on })}
            title={TOOLTIP}
          />
        </div>
        {s.brightness != null && (
          <SliderControl
            label="Brightness"
            value={s.brightness}
            onChange={(v) => updateDevice(device.id, { brightness: v })}
            title={TOOLTIP}
          />
        )}
        {s.color != null && (
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Color
            </span>
            <ColorPicker
              value={s.color}
              onChange={(v) => updateDevice(device.id, { color: v })}
              title={TOOLTIP}
            />
          </div>
        )}
      </div>
    );
  }

  if (isClimate(device)) {
    const s = device.state;
    if (device.type === "humidity_sensor") {
      return (
        <div className="text-sm">
          <span className="text-neutral-500">Humidity: </span>
          <span className="font-medium">{s.humidity ?? 0}%</span>
          <p className="mt-1 text-xs text-neutral-400">Read-only sensor (Zigbee)</p>
        </div>
      );
    }
    if (device.type === "temperature_sensor") {
      return (
        <div className="text-sm">
          <span className="text-neutral-500">Temperature: </span>
          <span className="font-medium">{s.temperature ?? 0}°C</span>
          <p className="mt-1 text-xs text-neutral-400">Read-only sensor (Zigbee)</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {s.on != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
            <ToggleSwitch
              checked={s.on}
              onChange={(on) => updateDevice(device.id, { on })}
              title={TOOLTIP}
            />
          </div>
        )}
        {device.type === "air_conditioner" && (
          <>
            <SliderControl
              label="Temperature"
              value={s.temperature ?? 22}
              min={16}
              max={30}
              unit="°C"
              onChange={(v) => updateDevice(device.id, { temperature: v })}
              title={TOOLTIP}
            />
            <div>
              <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
                Fan speed
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateDevice(device.id, { fanSpeed: n })}
                    className={`rounded px-2 py-1 text-sm ${
                      s.fanSpeed === n
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
                Mode
              </span>
              <select
                value={s.mode ?? "cool"}
                onChange={(e) => updateDevice(device.id, { mode: e.target.value })}
                className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="auto">Auto</option>
                <option value="dry">Dry</option>
              </select>
            </div>
          </>
        )}
        {device.type === "fan" && (
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Speed
            </span>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => updateDevice(device.id, { fanSpeed: speed })}
                  className={`rounded px-2 py-1 text-sm capitalize ${
                    s.fanSpeed === speed
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        )}
        {device.type === "heater" && (
          <SliderControl
            label="Temperature"
            value={s.temperature ?? 24}
            min={18}
            max={30}
            unit="°C"
            onChange={(v) => updateDevice(device.id, { temperature: v })}
            title={TOOLTIP}
          />
        )}
      </div>
    );
  }

  if (isPower(device)) {
    const s = device.state;
    if (device.type === "energy_meter") {
      return (
        <div className="text-sm">
          <span className="text-neutral-500">Usage: </span>
          <span className="font-medium">{s.energyKwh ?? 0} kWh</span>
          <p className="mt-1 text-xs text-neutral-400">Current reading</p>
        </div>
      );
    }
    if (device.type === "power_strip" && s.sockets) {
      return (
        <div className="space-y-2">
          {s.sockets.map((socket, i) => (
            <div key={socket.id} className="flex items-center justify-between">
              <span className="text-sm">Socket {i + 1}</span>
              <ToggleSwitch
                checked={socket.on}
                onChange={(on) => {
                  const next = [...s.sockets!];
                  next[i] = { ...next[i], on };
                  updateDevice(device.id, { sockets: next });
                }}
                title={TOOLTIP}
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Power</span>
        <ToggleSwitch
          checked={s.on ?? false}
          onChange={(on) => updateDevice(device.id, { on })}
          title={TOOLTIP}
        />
      </div>
    );
  }

  if (isAppliance(device)) {
    const s = device.state;
    if (device.type === "smart_tv") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Power</span>
            <ToggleSwitch
              checked={s.on ?? false}
              onChange={(on) => updateDevice(device.id, { on })}
              title={TOOLTIP}
            />
          </div>
          <SliderControl
            label="Volume"
            value={s.volume ?? 50}
            onChange={(v) => updateDevice(device.id, { volume: v })}
            title={TOOLTIP}
          />
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Input
            </span>
            <select
              value={s.input ?? "HDMI 1"}
              onChange={(e) => updateDevice(device.id, { input: e.target.value })}
              className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="HDMI 1">HDMI 1</option>
              <option value="HDMI 2">HDMI 2</option>
              <option value="HDMI 3">HDMI 3</option>
              <option value="TV">TV</option>
            </select>
          </div>
        </div>
      );
    }
    if (device.type === "refrigerator") {
      return (
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-neutral-500">Temp: </span>
            <span className="font-medium">{s.temp ?? 4}°C</span>
          </p>
          <p>
            <span className="text-neutral-500">Door: </span>
            <span className="font-medium">{s.doorOpen ? "Open" : "Closed"}</span>
          </p>
          <p className="text-xs text-neutral-400">Display only</p>
        </div>
      );
    }
    if (device.type === "washing_machine") {
      return (
        <div className="space-y-3">
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Mode
            </span>
            <select
              value={s.mode ?? "Cotton"}
              onChange={(e) => updateDevice(device.id, { mode: e.target.value })}
              className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="Cotton">Cotton</option>
              <option value="Delicate">Delicate</option>
              <option value="Quick">Quick</option>
            </select>
          </div>
          <SliderControl
            label="Progress"
            value={s.progress ?? 0}
            onChange={(v) => updateDevice(device.id, { progress: v })}
            title={TOOLTIP}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateDevice(device.id, { running: true, progress: s.progress ?? 0 })
              }
              className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 px-3 py-2 text-sm text-white"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
            <button
              type="button"
              onClick={() => updateDevice(device.id, { running: false })}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-neutral-200 px-3 py-2 text-sm dark:bg-neutral-700"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          </div>
        </div>
      );
    }
    if (device.type === "coffee_machine") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Brew</span>
            <ToggleSwitch
              checked={s.brewing ?? false}
              onChange={(v) => updateDevice(device.id, { brewing: v })}
              title={TOOLTIP}
            />
          </div>
          <div>
            <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Strength
            </span>
            <div className="flex gap-1">
              {(["mild", "medium", "strong"] as const).map((str) => (
                <button
                  key={str}
                  type="button"
                  onClick={() => updateDevice(device.id, { strength: str })}
                  className={`rounded px-2 py-1 text-sm capitalize ${
                    s.strength === str
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                >
                  {str}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm">Power</span>
        <ToggleSwitch
          checked={s.on ?? false}
          onChange={(on) => updateDevice(device.id, { on })}
          title={TOOLTIP}
        />
      </div>
    );
  }

  if (isSecurity(device)) {
    const s = device.state;
    if (device.type === "door_lock") {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">Lock</span>
          <button
            type="button"
            onClick={() => updateDevice(device.id, { locked: !s.locked })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            title={TOOLTIP}
          >
            {s.locked ? (
              <>
                <Lock className="h-4 w-4" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Unlocked
              </>
            )}
          </button>
        </div>
      );
    }
    if (device.type === "alarm") {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">Arm</span>
          <button
            type="button"
            onClick={() => updateDevice(device.id, { armed: !s.armed })}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              s.armed
                ? "bg-amber-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700"
            }`}
            title={TOOLTIP}
          >
            {s.armed ? (
              <>
                <Shield className="h-4 w-4" />
                Armed
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Disarmed
              </>
            )}
          </button>
        </div>
      );
    }
    if (device.type === "camera") {
      return (
        <div className="aspect-video w-full rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">
          Camera preview placeholder
        </div>
      );
    }
    return (
      <div className="text-sm">
        <span className="text-neutral-500">Status: </span>
        <span className="font-medium">
          {s.open != null && (s.open ? "Open" : "Closed")}
          {s.motion != null && (s.motion ? "Motion" : "No motion")}
        </span>
        <p className="mt-1 text-xs text-neutral-400">Read-only</p>
      </div>
    );
  }

  if (isSafety(device)) {
    const s = device.state;
    return (
      <div className="text-sm">
        <span className="text-neutral-500">Status: </span>
        <span className={`font-medium ${s.alarm || s.leak ? "text-amber-600" : "text-emerald-600"}`}>
          {s.alarm ? "Alarm" : s.leak ? "Leak detected" : "OK"}
        </span>
        <p className="mt-1 text-xs text-neutral-400">Read-only sensor</p>
      </div>
    );
  }

  if (isCurtains(device)) {
    const s = device.state;
    const pct = s.openPercent ?? 0;
    return (
      <div className="space-y-3">
        <SliderControl
          label="Open"
          value={pct}
          unit="%"
          onChange={(v) => updateDevice(device.id, { openPercent: v })}
          title={TOOLTIP}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateDevice(device.id, { openPercent: 100 })}
            className="flex-1 rounded bg-neutral-200 py-1.5 text-sm dark:bg-neutral-700"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => updateDevice(device.id, { openPercent: 0 })}
            className="flex-1 rounded bg-neutral-200 py-1.5 text-sm dark:bg-neutral-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isOutdoor(device)) {
    const s = device.state;
    if (device.type === "gate") {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">Gate</span>
          <button
            type="button"
            onClick={() => updateDevice(device.id, { open: !s.open })}
            className="rounded bg-emerald-600 px-3 py-2 text-sm text-white"
            title={TOOLTIP}
          >
            {s.open ? "Close" : "Open"}
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Power</span>
          <ToggleSwitch
            checked={s.on ?? false}
            onChange={(on) => updateDevice(device.id, { on })}
            title={TOOLTIP}
          />
        </div>
        {s.brightness != null && (
          <SliderControl
            label="Brightness"
            value={s.brightness}
            onChange={(v) => updateDevice(device.id, { brightness: v })}
            title={TOOLTIP}
          />
        )}
      </div>
    );
  }

  return null;
}
