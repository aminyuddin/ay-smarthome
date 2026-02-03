"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { Settings, Info, Server, Database, Link2, Save, Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

function ConnectionStatusBadge({
  status,
  error,
}: {
  status: "disconnected" | "connecting" | "connected" | "error";
  error: Error | null;
}) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        <Wifi className="h-3.5 w-3.5" />
        Connected
      </span>
    );
  }
  if (status === "connecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting…
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
        <AlertCircle className="h-3.5 w-3.5" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      <WifiOff className="h-3.5 w-3.5" />
      Disconnected
    </span>
  );
}

export default function SettingsPage() {
  const { config, updateConfig, connectionStatus, connectionError } = useHomeAssistant();
  const [haUrl, setHaUrl] = useState(config.haUrl);
  const [haToken, setHaToken] = useState(config.haToken);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHaUrl(config.haUrl);
    setHaToken(config.haToken);
  }, [config.haUrl, config.haToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({ haUrl, haToken });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <Settings className="h-8 w-8 shrink-0 text-emerald-600" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
            Settings
          </h1>
          <p className="text-sm text-neutral-500">
            Home Assistant connection and dashboard behaviour
          </p>
        </div>
      </div>
      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {/* Home Assistant connection */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Server className="h-5 w-5 shrink-0" />
              Home Assistant
            </h2>
            <ConnectionStatusBadge status={connectionStatus} error={connectionError} />
          </div>
          {connectionStatus === "error" && connectionError?.message && (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
              role="alert"
            >
              <p className="font-medium">What went wrong</p>
              <p className="mt-1 break-words text-red-700 dark:text-red-300">{connectionError.message}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Base URL
              </label>
              <input
                type="url"
                value={haUrl}
                onChange={(e) => setHaUrl(e.target.value)}
                className="w-full min-w-0 rounded border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:text-sm"
                placeholder="http://homeassistant.local:8123"
                autoComplete="url"
              />
              <p className="text-xs text-neutral-500">
                URL of your Home Assistant instance (e.g. http://homeassistant.local:8123). Save with a token to connect.
              </p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Long-lived access token
              </label>
              <input
                type="password"
                value={haToken}
                onChange={(e) => setHaToken(e.target.value)}
                className="w-full min-w-0 rounded border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:text-sm"
                placeholder={config.haTokenConfigured ? "••••••••••••••" : "Paste token here"}
                autoComplete="off"
              />
              <p className="text-xs text-neutral-500">
                Long-lived access token from your HA profile. Stored in this browser only (localStorage); no backend.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="submit"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white active:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                Save connection
              </button>
              {saved && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  Saved
                </span>
              )}
              <Link
                href="/settings/integrations"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-700 active:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:active:bg-neutral-800 sm:ml-auto sm:py-1.5 sm:text-xs"
              >
                <Link2 className="h-4 w-4" />
                View integrations
              </Link>
            </div>
          </form>
        </section>

        {/* About / data notes */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Info className="h-5 w-5 shrink-0" />
            About
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            The dashboard renders Home Assistant entities by domain (light,
            switch, sensor, etc.). Use the connection settings above to connect
            to your Home Assistant instance.
          </p>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Database className="h-5 w-5 shrink-0" />
            Data
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Automations, entity state and connection settings are synced with
            your Home Assistant instance. Changes are reflected across your
            dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
