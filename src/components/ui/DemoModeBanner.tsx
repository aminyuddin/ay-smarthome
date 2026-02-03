"use client";

import { Info } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20"
      role="status"
      aria-label="Status"
    >
      <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
        System status
      </p>
      <span className="text-xs text-amber-700 dark:text-amber-300">
        Connection details are managed by Home Assistant and integrations.
      </span>
    </div>
  );
}
