"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  LayoutGrid,
  Cpu,
  Zap,
  Leaf,
  Shield,
  Settings,
  Radio,
  Network,
  X,
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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="AY Smart Home"
            width={28}
            height={28}
            className="shrink-0 rounded"
          />
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
            AY Smart Home
          </span>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {onMobileClose && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={onMobileClose}
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
            mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
          }`}
        />
      )}
      {/* Sidebar: drawer on mobile, fixed (locked) on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-full w-64 max-w-[85vw] flex-col border-r border-neutral-200 bg-neutral-50 shadow-xl transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900/50
          lg:w-56 lg:max-w-none lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {navContent}
      </aside>
    </>
  );
}
