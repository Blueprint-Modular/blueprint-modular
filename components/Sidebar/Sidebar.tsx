"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  BookOpen,
  Boxes,
  Play,
  FolderOpen,
  BookMarked,
  Bot,
  FileText,
  Radio,
  Settings,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/NotificationBell";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/docs/components", label: "Composants", icon: Boxes },
  { href: "/sandbox", label: "Sandbox", icon: Play },
  { href: "/modules", label: "Modules", icon: FolderOpen },
  { href: "/modules/wiki", label: "Module Wiki", icon: BookMarked },
  { href: "/modules/ia", label: "Module IA", icon: Bot },
  { href: "/modules/documents", label: "Module Documents", icon: FileText },
  { href: "/modules/veille", label: "Module Veille", icon: Radio },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavIcon = ({
    icon: Icon,
    label,
    href,
    compact = false,
  }: { icon: React.ElementType; label: string; href: string; compact?: boolean }) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    const showLabel = compact ? true : !collapsed;
    return (
      <Link
        href={href}
        className={`flex items-center rounded-lg transition ${compact ? "flex-col gap-0.5 px-2 py-2 min-w-0" : "gap-3 px-3 py-2.5"}`}
        style={{
          background: isActive ? "var(--bpm-accent-cyan)" : "transparent",
          color: isActive ? "#fff" : "var(--bpm-sidebar-text)",
        }}
        title={compact ? label : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {showLabel && <span className={compact ? "text-xs font-medium truncate max-w-[4rem]" : "text-sm font-medium truncate"}>{label}</span>}
      </Link>
    );
  };

  /* Barre mobile en bas (style doc) */
  const mobileNavBar = (
    <aside
      className="fixed left-0 right-0 bottom-0 z-40 md:hidden flex flex-row items-center justify-around overflow-x-auto overflow-y-hidden border-t px-1 pb-[env(safe-area-inset-bottom,0)] pt-2"
      style={{
        background: "var(--bpm-sidebar-bg)",
        color: "var(--bpm-sidebar-text)",
        borderColor: "var(--bpm-sidebar-border)",
        minHeight: "calc(56px + env(safe-area-inset-bottom, 0))",
      }}
    >
      {navItems.slice(0, 6).map((item) => (
        <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} compact />
      ))}
      <Link
        href="/settings"
        className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg min-w-0 transition"
        style={{
          color: pathname.startsWith("/settings") ? "var(--bpm-accent-cyan)" : "var(--bpm-sidebar-text)",
        }}
        title="Paramètres"
      >
        <Settings className="w-5 h-5 shrink-0" />
        <span className="text-xs truncate">Param.</span>
      </Link>
    </aside>
  );

  return (
    <>
      {/* Mobile : barre en bas (grise, style doc) */}
      {mobileNavBar}

      {/* Desktop : sidebar verticale grise à gauche */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full flex-col
          w-64 transition-[width] duration-200 ease-in-out
          hidden md:flex
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
        style={{ background: "var(--bpm-sidebar-bg)", color: "var(--bpm-sidebar-text)", borderRight: "1px solid var(--bpm-sidebar-border)" }}
      >
        <div className="flex items-center justify-between h-14 px-3 border-b shrink-0" style={{ borderColor: "var(--bpm-sidebar-border)" }}>
          {!collapsed && (
            <Link href="/dashboard" className="font-bold truncate" style={{ color: "var(--bpm-sidebar-text)" }}>
              Blueprint Modular
            </Link>
          )}
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded hover:opacity-80"
            style={{ color: "var(--bpm-sidebar-text)" }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Ouvrir" : "Réduire"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => (
            <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        <div className="p-2 border-t shrink-0 space-y-1" style={{ borderColor: "var(--bpm-sidebar-border)" }}>
          <div className="flex items-center gap-1">
            <div className="flex-1 min-w-0">
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:opacity-80"
                style={{ color: "var(--bpm-sidebar-text)" }}
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                {!collapsed && <span className="text-sm truncate">Thème</span>}
              </button>
            </div>
            <div className="[&_.notification-bell-button]:rounded-lg" style={{ color: "var(--bpm-sidebar-text)" }}>
              <NotificationBell />
            </div>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              {session.user.image ? (
                <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: "var(--bpm-accent-cyan)" }}>
                  {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              {!collapsed && (
                <span className="text-sm truncate" style={{ color: "var(--bpm-sidebar-text)" }}>{session.user.name ?? session.user.email}</span>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
