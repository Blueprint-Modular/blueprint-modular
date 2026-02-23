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

  const NavIcon = ({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition"
        style={{
          background: isActive ? "var(--bpm-accent-cyan)" : "transparent",
          color: isActive ? "#fff" : "var(--bpm-text-primary)",
        }}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed bottom-4 left-4 z-50 md:hidden flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
        style={{ background: "var(--bpm-sidebar-bg)", color: "#fff" }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar desktop + drawer mobile */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full flex flex-col
          w-64 md:w-64
          transition-[width] duration-200 ease-in-out
          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
        style={{ background: "var(--bpm-sidebar-bg)", color: "#fff" }}
      >
        <div className="flex items-center justify-between h-14 px-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {!collapsed && (
            <Link href="/dashboard" className="font-bold text-white">
              Blueprint Modular
            </Link>
          )}
          <button
            type="button"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded hover:bg-white/10"
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

        <div className="p-2 border-t shrink-0 space-y-1" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">Thème</span>}
          </button>
          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              {session.user.image ? (
                <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ background: "var(--bpm-accent-cyan)" }}>
                  {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              {!collapsed && (
                <span className="text-sm truncate">{session.user.name ?? session.user.email}</span>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
