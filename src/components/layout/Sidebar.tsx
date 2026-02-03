"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Cpu,
  Zap,
  Leaf,
  Shield,
  Gauge,
  Settings,
  Radio,
  Network,
} from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rooms", label: "Rooms", icon: LayoutGrid },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/protocols", label: "Protocols", icon: Network },
  { href: "/gateways", label: "Gateways", icon: Radio },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/energy", label: "Energy", icon: Leaf },
  { href: "/security", label: "Security", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
        <Gauge className="h-6 w-6 text-emerald-600" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
          AY Smart Home
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
