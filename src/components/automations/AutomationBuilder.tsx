"use client";

import type { Automation } from "@/lib/types/automation";
import { AutomationRuleEditor } from "./AutomationRuleEditor";

/**
 * AutomationBuilder: IF (time / device / sensor) THEN (device actions).
 */
interface AutomationBuilderProps {
  onSave: (automation: Automation) => void;
  onCancel: () => void;
}

export function AutomationBuilder({ onSave, onCancel }: AutomationBuilderProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Rules run on your Home Assistant instance. Triggers and actions use
        your configured entities and services.
      </p>
      <AutomationRuleEditor onSave={onSave} onCancel={onCancel} />
    </div>
  );
}
