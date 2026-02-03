"use client";

import type { HADomain } from "@/lib/home-assistant/types";
import {
  Lightbulb,
  ToggleLeft,
  Gauge,
  Activity,
  Lock,
  Thermometer,
  Blinds,
  Fan,
  Shield,
  Video,
} from "lucide-react";

const DOMAIN_ICONS: Record<HADomain, React.ComponentType<{ className?: string }>> = {
  light: Lightbulb,
  switch: ToggleLeft,
  sensor: Gauge,
  binary_sensor: Activity,
  lock: Lock,
  climate: Thermometer,
  cover: Blinds,
  fan: Fan,
  alarm_control_panel: Shield,
  camera: Video,
};

interface DomainIconProps {
  domain: HADomain | string | null;
  className?: string;
}

export function DomainIcon({ domain, className = "" }: DomainIconProps) {
  const Icon = domain && domain in DOMAIN_ICONS ? DOMAIN_ICONS[domain as HADomain] : Gauge;
  return <Icon className={className} />;
}
