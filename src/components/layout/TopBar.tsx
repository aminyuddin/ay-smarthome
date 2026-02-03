"use client";

import { useEffect, useState } from "react";
import { Cloud, Menu, User } from "lucide-react";

const HOME_NAME = "My Home";
const MOCK_WEATHER = { temp: 22, condition: "Partly cloudy", icon: "⛅" };

function useTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    format();
    const id = setInterval(format, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const time = useTime();
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="truncate text-base font-semibold text-neutral-800 dark:text-neutral-100 sm:text-lg">
          {HOME_NAME}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
          {time}
        </span>
        <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800 sm:gap-2 sm:px-3">
          <Cloud className="h-4 w-4 shrink-0 text-neutral-500" />
          <span className="whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
            <span className="sm:hidden">{MOCK_WEATHER.temp}°C</span>
            <span className="hidden sm:inline">
              {MOCK_WEATHER.temp}°C · {MOCK_WEATHER.condition}
            </span>
          </span>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
