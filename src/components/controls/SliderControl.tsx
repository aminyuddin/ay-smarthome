"use client";

import { useId } from "react";

interface SliderControlProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  unit?: string;
  title?: string;
}

export function SliderControl({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  label,
  unit = "",
  title = "Not connected to device yet",
}: SliderControlProps) {
  const id = useId();
  return (
    <div className="w-full" title={title}>
      {(label != null || unit) && (
        <div className="mb-1 flex justify-between text-sm">
          {label != null && (
            <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
          )}
          <span className="font-medium tabular-nums">
            {value}
            {unit}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-600 dark:bg-neutral-700"
      />
    </div>
  );
}
