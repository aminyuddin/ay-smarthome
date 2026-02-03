"use client";

import { useState } from "react";
import Link from "next/link";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { Settings, Info, Server, Database, Link2, Save } from "lucide-react";

export default function SettingsPage() {
  const { config, updateConfig } = useHomeAssistant();
  const [haUrl, setHaUrl] = useState(config.haUrl);
  const [haToken, setHaToken] = useState(config.haToken);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({ haUrl, haToken });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="text-sm text-neutral-500">
            Home Assistant connection and dashboard behaviour
          </p>
        </div>
      </div>
      <div className="max-w-2xl space-y-6">
        {/* Home Assistant connection */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Server className="h-5 w-5" />
            Home Assistant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Base URL
              </label>
              <input
                type="url"
                value={haUrl}
                onChange={(e) => setHaUrl(e.target.value)}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="http://homeassistant.local:8123"
              />
              <p className="text-xs text-neutral-500">
                URL of your Home Assistant instance (no real connection is made yet).
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
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder={config.haTokenConfigured ? "••••••••••••••" : "Paste token here"}
              />
              <p className="text-xs text-neutral-500">
                Stored only in this session. In a real setup this would be used for
                authenticated API calls.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              >
                <Save className="h-4 w-4" />
                Save connection
              </button>
              {saved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  Saved
                </span>
              )}
              <Link
                href="/settings/integrations"
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                <Link2 className="h-4 w-4" />
                View integrations
              </Link>
            </div>
          </form>
        </section>

        {/* About / data notes */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Info className="h-5 w-5" />
            About
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            The dashboard renders Home Assistant entities by domain (light,
            switch, sensor, etc.). Use the connection settings above to connect
            to your Home Assistant instance.
          </p>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Database className="h-5 w-5" />
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
