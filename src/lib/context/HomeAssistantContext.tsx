"use client";

/**
 * Home Assistant state and service layer.
 * Single source of truth: entity state (mock in demo). Real HA integration
 * replaces mock-state and service handlers only; this context API stays.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { HAStateStore, HAEntityState } from "@/lib/home-assistant/types";
import type { HADomain } from "@/lib/home-assistant/types";
import { initialHAState } from "@/lib/home-assistant/mock-state";
import { applyServiceCall } from "@/lib/home-assistant/services";
import {
  dashboardDevices as staticDashboardDevices,
  entitiesToDashboardDevices,
  type DashboardDevice,
} from "@/lib/home-assistant/entity-mapper";
import {
  connect as realConnect,
  disconnect as realDisconnect,
  callService as realCallService,
  setRealHACallbacks,
  getConnectionStatus,
  getLastError,
  getConnection,
  getHaConfig,
  type ConnectionStatus,
} from "@/lib/home-assistant/real-api";
import { fetchAllAutomationConfigs, createOrUpdateAutomation, deleteAutomation } from "@/lib/home-assistant/automation-api";
import { haConfigToAutomation, automationToHaConfig, automationConfigIdFromOurId } from "@/lib/home-assistant/automation-mapper";
import { loadHAConfig, saveHAConfig, clearHAConfig } from "@/lib/home-assistant/config-storage";
import { gateways as staticGateways } from "@/lib/data/gateways";
import type { Gateway } from "@/lib/types/gateway";
import type { Automation } from "@/lib/types/automation";
import { initialAutomations } from "@/lib/data/automations";

const DEFAULT_HA_URL = "http://homeassistant.local:8123";
const INITIAL_CONFIG: HAConfig = {
  haUrl: DEFAULT_HA_URL,
  haToken: "",
  haTokenConfigured: false,
};

interface HAConfig {
  haUrl: string;
  haToken: string;
  haTokenConfigured: boolean;
}

interface HomeAssistantContextValue {
  /** Entity state store (HA single source of truth) */
  entities: HAStateStore;
  getEntity: (entityId: string) => HAEntityState | undefined;
  /** HA service call – real API when connected, mock when not */
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
  /** True when gateways list is from HA discovery (not sample data) */
  gatewaysFromHA: boolean;
  /** Home Assistant connection config (local, editable via Settings) */
  config: HAConfig;
  updateConfig: (config: Partial<HAConfig>) => void;
  /** Connection status when using real HA */
  connectionStatus: ConnectionStatus;
  /** Last connection error (e.g. invalid auth) */
  connectionError: Error | null;
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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [config, setConfig] = useState<HAConfig>(INITIAL_CONFIG);
  const [discoveredGateways, setDiscoveredGateways] = useState<Gateway[]>([]);
  const hasLoadedAutomationsRef = useRef(false);

  useEffect(() => {
    const stored = loadHAConfig();
    if (stored?.haUrl && stored?.haToken) {
      setConfig({
        haUrl: stored.haUrl,
        haToken: stored.haToken,
        haTokenConfigured: true,
      });
    }
  }, []);

  useEffect(() => {
    setRealHACallbacks({
      onState: setEntities,
      onStatus: (s, err) => {
        setConnectionStatus(s);
        setConnectionError(err);
      },
      onGateways: setDiscoveredGateways,
    });
    return () => {
      setRealHACallbacks({});
    };
  }, []);

  useEffect(() => {
    const { haUrl, haToken, haTokenConfigured } = config;
    if (haTokenConfigured && haUrl?.trim() && haToken?.trim()) {
      realConnect(haUrl, haToken).catch(() => {
        setConnectionStatus(getConnectionStatus());
        setConnectionError(getLastError());
      });
      return () => {
        realDisconnect();
      };
    }
    realDisconnect();
    setEntities(initialHAState);
    setAutomations(initialAutomations);
    setDiscoveredGateways([]);
    setConnectionStatus("disconnected");
    setConnectionError(null);
  }, [config.haUrl, config.haToken, config.haTokenConfigured]);

  const loadAutomationsFromHA = useCallback(async () => {
    const conn = getConnection();
    if (!conn) return;
    const list = await fetchAllAutomationConfigs(conn, entities);
    const devices = Object.keys(entities).length > 0 ? entitiesToDashboardDevices(entities) : staticDashboardDevices;
    const mapped: Automation[] = [];
    for (const { entityId, config } of list) {
      const a = haConfigToAutomation(entityId, config, devices);
      if (a) mapped.push(a);
    }
    setAutomations(mapped);
  }, [entities]);

  useEffect(() => {
    if (connectionStatus !== "connected" || Object.keys(entities).length === 0) return;
    if (hasLoadedAutomationsRef.current) return;
    hasLoadedAutomationsRef.current = true;
    loadAutomationsFromHA();
  }, [connectionStatus, entities, loadAutomationsFromHA]);

  useEffect(() => {
    if (connectionStatus !== "connected") hasLoadedAutomationsRef.current = false;
  }, [connectionStatus]);

  const getEntity = useCallback(
    (entityId: string) => entities[entityId],
    [entities]
  );

  const callService = useCallback(
    async (
      domain: HADomain,
      service: string,
      data: Record<string, unknown> & { entity_id: string | string[] }
    ) => {
      if (connectionStatus === "connected") {
        try {
          await realCallService(domain, service, data);
        } catch {
          // Real API error; state will update via WebSocket when HA applies the change
        }
        return;
      }
      setEntities((prev) => applyServiceCall(prev, domain, service, data));
    },
    [connectionStatus]
  );

  const dashboardDevices = useMemo(() => {
    if (connectionStatus === "connected" && Object.keys(entities).length > 0) {
      return entitiesToDashboardDevices(entities);
    }
    return staticDashboardDevices;
  }, [connectionStatus, entities]);

  const getDevicesByRoom = useCallback(
    (roomId: string) => dashboardDevices.filter((d) => d.roomId === roomId),
    [dashboardDevices]
  );

  const getDevicesByCategory = useCallback(
    (category: DashboardDevice["category"]) =>
      dashboardDevices.filter((d) => d.category === category),
    [dashboardDevices]
  );

  const gateways = useMemo(() => {
    if (connectionStatus === "connected" && discoveredGateways.length > 0) {
      return discoveredGateways;
    }
    return staticGateways;
  }, [connectionStatus, discoveredGateways]);

  const gatewaysFromHA =
    connectionStatus === "connected" && discoveredGateways.length > 0;

  const getGateway = useCallback(
    (gatewayId: string) => gateways.find((g) => g.id === gatewayId),
    [gateways]
  );

  const addAutomation = useCallback(
    async (a: Automation) => {
      if (connectionStatus === "connected") {
        try {
          const { baseUrl, token } = getHaConfig();
          const devices = Object.keys(entities).length > 0 ? entitiesToDashboardDevices(entities) : staticDashboardDevices;
          const haConfig = automationToHaConfig(a, devices);
          const configId = automationConfigIdFromOurId(a.id, a.name);
          await createOrUpdateAutomation(baseUrl, token, configId, haConfig);
          hasLoadedAutomationsRef.current = false;
          await loadAutomationsFromHA();
        } catch {
          setAutomations((prev) => [...prev, a]);
        }
        return;
      }
      setAutomations((prev) => [...prev, a]);
    },
    [connectionStatus, entities, loadAutomationsFromHA]
  );

  const updateAutomation = useCallback(
    (id: string, a: Partial<Automation>) => {
      setAutomations((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...a } : x))
      );
      if (connectionStatus === "connected" && a.enabled !== undefined) {
        const entityId = id.startsWith("automation.") ? id : `automation.${id}`;
        realCallService("automation", a.enabled ? "turn_on" : "turn_off", { entity_id: entityId }).catch(() => {});
      }
    },
    [connectionStatus]
  );

  const removeAutomation = useCallback(
    async (id: string) => {
      if (connectionStatus === "connected") {
        try {
          const { baseUrl, token } = getHaConfig();
          const configId = id.startsWith("automation.") ? id.replace("automation.", "") : id;
          await deleteAutomation(baseUrl, token, configId);
          hasLoadedAutomationsRef.current = false;
          await loadAutomationsFromHA();
        } catch {
          setAutomations((prev) => prev.filter((x) => x.id !== id));
        }
        return;
      }
      setAutomations((prev) => prev.filter((x) => x.id !== id));
    },
    [connectionStatus, loadAutomationsFromHA]
  );

  const updateConfig = useCallback((partial: Partial<HAConfig>) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        ...partial,
        haTokenConfigured: !!(partial.haToken ?? prev.haToken),
      };
      const url = next.haUrl?.trim();
      const token = next.haToken?.trim();
      if (url && token) {
        saveHAConfig({ haUrl: url, haToken: token });
      } else {
        clearHAConfig();
      }
      return next;
    });
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
      gatewaysFromHA,
      automations,
      addAutomation,
      updateAutomation,
      removeAutomation,
      config,
      updateConfig,
      connectionStatus,
      connectionError,
    }),
    [
      entities,
      getEntity,
      callService,
      dashboardDevices,
      getDevicesByRoom,
      getDevicesByCategory,
      getGateway,
      gateways,
      gatewaysFromHA,
      automations,
      addAutomation,
      updateAutomation,
      removeAutomation,
      config,
      updateConfig,
      connectionStatus,
      connectionError,
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
