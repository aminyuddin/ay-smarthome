"use client";

import { Search, X } from "lucide-react";

interface DeviceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function DeviceSearchInput({
  value,
  onChange,
  placeholder = "Search devices…",
  className = "",
  id = "device-search",
}: DeviceSearchInputProps) {
  return (
    <div
      className={`relative flex items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
      <input
        id={id}
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-lg border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        autoComplete="off"
        aria-label="Search devices by name, room, category, or entity ID"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
