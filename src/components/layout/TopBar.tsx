"use client";

import { useEffect, useState } from "react";
import { Cloud, User } from "lucide-react";

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

export function TopBar() {
  const time = useTime();
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
        {HOME_NAME}
      </h1>
      <div className="flex items-center gap-6">
        <span className="text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
          {time}
        </span>
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">
          <Cloud className="h-4 w-4 text-neutral-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {MOCK_WEATHER.temp}°C · {MOCK_WEATHER.condition}
          </span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
