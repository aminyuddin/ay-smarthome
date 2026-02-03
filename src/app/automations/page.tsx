"use client";

import { useState } from "react";
import { useHomeAssistant } from "@/lib/context/HomeAssistantContext";
import { AutomationCard } from "@/components/automations/AutomationCard";
import { AutomationBuilder } from "@/components/automations/AutomationBuilder";
import type { Automation } from "@/lib/types/automation";
import { Zap, Plus } from "lucide-react";

export default function AutomationsPage() {
  const { automations, removeAutomation } = useHomeAssistant();
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = (_a: Automation) => {
    setShowEditor(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Automations
            </h1>
            <p className="text-sm text-neutral-500">
              Trigger / Condition / Action · HA service calls (stored locally)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          New automation
        </button>
      </div>
      {showEditor && (
        <div className="mb-8">
          <AutomationBuilder onSave={handleSave} onCancel={() => setShowEditor(false)} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {automations.map((automation) => (
          <AutomationCard
            key={automation.id}
            automation={automation}
            onDelete={removeAutomation}
          />
        ))}
      </div>
    </div>
  );
}
