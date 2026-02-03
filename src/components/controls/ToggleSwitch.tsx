"use client";

import { useId } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  title?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  title,
}: ToggleSwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2" title={title}>
      <label
        htmlFor={id}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 ${
          checked
            ? "border-emerald-500 bg-emerald-500/20 dark:bg-emerald-500/25"
            : "border-neutral-300 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </label>
      {label != null && (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {label}
        </span>
      )}
    </div>
  );
}
