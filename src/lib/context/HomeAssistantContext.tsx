"use client";

/**
 * Home Assistant state and service layer.
 * Single source of truth: entity state (mock in demo). Real HA integration
 * replaces mock-state and service handlers only; this context API stays.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { HAStateStore, HAEntityState } from "@/lib/home-assistant/types";
import type { HADomain } from "@/lib/home-assistant/types";
import { initialHAState } from "@/lib/home-assistant/mock-state";
import { applyServiceCall } from "@/lib/home-assistant/services";
import { getDomain } from "@/lib/home-assistant/entities";
import {
  dashboardDevices,
  getPrimaryEntityId,
  type DashboardDevice,
} from "@/lib/home-assistant/entity-mapper";
import { gateways } from "@/lib/data/gateways";
import type { Gateway } from "@/lib/types/gateway";
import type { Automation } from "@/lib/types/automation";
import { initialAutomations } from "@/lib/data/automations";

interface HAConfig {
  haUrl: string;
  haToken: string;
  haTokenConfigured: boolean;
}

interface HomeAssistantContextValue {
  /** Entity state store (HA single source of truth) */
  entities: HAStateStore;
  getEntity: (entityId: string) => HAEntityState | undefined;
  /** Simulate HA service call – updates mock state only */
  callService: (
    domain: HADomain,
    service: string,
    data: Record<string, unknown> & { entity_id: string | string[] }
  ) => void;
  /** Dashboard device list (maps to entities) */
  dashboardDevices: DashboardDevice[];
  getDevicesByRoom: (roomId: string) => DashboardDevice[];
  getDevicesByCategory: (category: DashboardDevice["category"]) => DashboardDevice[];
  getGateway: (gatewayId: string) => Gateway | undefined;
  gateways: Gateway[];
  /** Home Assistant connection config (local, editable via Settings) */
  config: HAConfig;
  updateConfig: (config: Partial<HAConfig>) => void;
  /** Automations (Trigger / Condition / Action; stored locally) */
  automations: Automation[];
  addAutomation: (a: Automation) => void;
  updateAutomation: (id: string, a: Partial<Automation>) => void;
  removeAutomation: (id: string) => void;
}

const HomeAssistantContext = createContext<HomeAssistantContextValue | null>(null);

export function HomeAssistantProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<HAStateStore>(initialHAState);
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [config, setConfig] = useState<HAConfig>({
    haUrl: "http://homeassistant.local:8123",
    haToken: "",
    haTokenConfigured: false,
  });

  const getEntity = useCallback(
    (entityId: string) => entities[entityId],
    [entities]
  );

  const callService = useCallback(
    (
      domain: HADomain,
      service: string,
      data: Record<string, unknown> & { entity_id: string | string[] }
    ) => {
      setEntities((prev) => applyServiceCall(prev, domain, service, data));
    },
    []
  );

  const getDevicesByRoom = useCallback(
    (roomId: string) => dashboardDevices.filter((d) => d.roomId === roomId),
    []
  );

  const getDevicesByCategory = useCallback(
    (category: DashboardDevice["category"]) =>
      dashboardDevices.filter((d) => d.category === category),
    []
  );

  const getGateway = useCallback(
    (gatewayId: string) => gateways.find((g) => g.id === gatewayId),
    []
  );

  const addAutomation = useCallback((a: Automation) => {
    setAutomations((prev) => [...prev, a]);
  }, []);

  const updateAutomation = useCallback((id: string, a: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...a } : x))
    );
  }, []);

  const removeAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateConfig = useCallback((partial: Partial<HAConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial, haTokenConfigured: !!(partial.haToken ?? prev.haToken) }));
  }, []);

  const value = useMemo(
    () => ({
      entities,
      getEntity,
      callService,
      dashboardDevices,
      getDevicesByRoom,
      getDevicesByCategory,
      getGateway,
      gateways,
      automations,
      addAutomation,
      updateAutomation,
      removeAutomation,
      config,
      updateConfig,
    }),
    [
      entities,
      getEntity,
      callService,
      getDevicesByRoom,
      getDevicesByCategory,
      getGateway,
      automations,
      addAutomation,
      updateAutomation,
      removeAutomation,
      config,
      updateConfig,
    ]
  );

  return (
    <HomeAssistantContext.Provider value={value}>
      {children}
    </HomeAssistantContext.Provider>
  );
}

export function useHomeAssistant() {
  const ctx = useContext(HomeAssistantContext);
  if (!ctx) throw new Error("useHomeAssistant must be used within HomeAssistantProvider");
  return ctx;
}
