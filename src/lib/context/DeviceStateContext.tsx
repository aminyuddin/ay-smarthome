"use client";

/**
 * Device state context: local React state only (no backend).
 * Zigbee integration would plug in here: replace updateDevice/getDevice with
 * API/Event Bus subscription (dashboard never talks to Zigbee directly).
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Device } from "@/lib/types/device";
import type { Gateway } from "@/lib/types/gateway";
import { initialDevices } from "@/lib/data/devices";
import { initialAutomations } from "@/lib/data/automations";
import { gateways } from "@/lib/data/gateways";
import type { Automation } from "@/lib/types/automation";

type DeviceStateUpdate = Partial<Device["state"]> & { [key: string]: unknown };

interface DeviceStateContextValue {
  devices: Device[];
  automations: Automation[];
  gateways: Gateway[];
  updateDevice: (deviceId: string, state: DeviceStateUpdate) => void;
  getDevice: (deviceId: string) => Device | undefined;
  getGateway: (gatewayId: string) => Gateway | undefined;
  getDevicesByRoom: (roomId: string) => Device[];
  getDevicesByCategory: (category: Device["category"]) => Device[];
  getDevicesByGateway: (gatewayId: string) => Device[];
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, automation: Partial<Automation>) => void;
  removeAutomation: (id: string) => void;
}

const DeviceStateContext = createContext<DeviceStateContextValue | null>(null);

export function DeviceStateProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);

  const updateDevice = useCallback((deviceId: string, stateUpdate: DeviceStateUpdate) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          state: { ...d.state, ...stateUpdate },
        } as Device;
      })
    );
  }, []);

  const getDevice = useCallback(
    (deviceId: string) => devices.find((d) => d.id === deviceId),
    [devices]
  );

  const getDevicesByRoom = useCallback(
    (roomId: string) => devices.filter((d) => d.roomId === roomId),
    [devices]
  );

  const getDevicesByCategory = useCallback(
    (category: Device["category"]) => devices.filter((d) => d.category === category),
    [devices]
  );

  const getGateway = useCallback(
    (gatewayId: string) => gateways.find((g) => g.id === gatewayId),
    []
  );

  const getDevicesByGateway = useCallback(
    (gatewayId: string) => devices.filter((d) => d.gatewayId === gatewayId),
    [devices]
  );

  const addAutomation = useCallback((automation: Automation) => {
    setAutomations((prev) => [...prev, automation]);
  }, []);

  const updateAutomation = useCallback((id: string, automation: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...automation } : a))
    );
  }, []);

  const removeAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      devices,
      automations,
      gateways,
      updateDevice,
      getDevice,
      getGateway,
      getDevicesByRoom,
      getDevicesByCategory,
      getDevicesByGateway,
      addAutomation,
      updateAutomation,
      removeAutomation,
    }),
    [
      devices,
      automations,
      updateDevice,
      getDevice,
      getGateway,
      getDevicesByRoom,
      getDevicesByCategory,
      getDevicesByGateway,
      addAutomation,
      updateAutomation,
      removeAutomation,
    ]
  );

  return (
    <DeviceStateContext.Provider value={value}>
      {children}
    </DeviceStateContext.Provider>
  );
}

export function useDeviceState() {
  const ctx = useContext(DeviceStateContext);
  if (!ctx) throw new Error("useDeviceState must be used within DeviceStateProvider");
  return ctx;
}
