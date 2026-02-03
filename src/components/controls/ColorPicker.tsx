"use client";

const PRESET_COLORS = [
  "#ffffff",
  "#ff6b9d",
  "#ff9f43",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#9b59b6",
  "#e74c3c",
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  title?: string;
}

export function ColorPicker({
  value,
  onChange,
  disabled = false,
  title = "Not connected to device yet",
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" title={title}>
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
            value.toLowerCase() === color.toLowerCase()
              ? "border-neutral-800 dark:border-white"
              : "border-neutral-300 dark:border-neutral-600"
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Color ${color}`}
        />
      ))}
      <label className="flex items-center gap-1">
        <span className="text-xs text-neutral-500">Custom</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
        />
      </label>
    </div>
  );
}
