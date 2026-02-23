"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  Boxes,
  Play,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/docs/components", label: "Composants", icon: Boxes },
  { href: "/modules", label: "Modules", icon: FolderOpen },
  { href: "/sandbox", label: "Sandbox", icon: Play },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const LOGO_CANDIDATES = ["/img/logo-bpm-nom.jpg", "/img/logo-bpm-nom.png"];
/** Couleurs fixes du logo (ne varient pas avec le wizard / couleur d'accent) */
const LOGO_BLUE = "#1a4b8f";
const LOGO_CYAN = "#00a3e0";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = LOGO_CANDIDATES[logoIndex] ?? LOGO_CANDIDATES[0];
  const handleLogoError = () => {
    if (logoIndex < LOGO_CANDIDATES.length - 1) setLogoIndex((i) => i + 1);
    else setLogoError(true);
  };

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
        className={`flex items-center transition ${compact ? "flex-col gap-0.5 py-2 min-w-0 rounded-lg flex-1 basis-0 justify-center" : "gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bpm-sidebar-hover-bg)]"}`}
        style={{
          background: compact ? "transparent" : isActive ? "var(--bpm-sidebar-active-bg)" : "transparent",
          color: compact ? (isActive ? "var(--bpm-accent-cyan)" : "var(--bpm-sidebar-text)") : "var(--bpm-sidebar-text)",
        }}
        title={compact ? label : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {showLabel && <span className={compact ? "text-xs font-normal truncate max-w-full text-center" : "text-sm font-normal truncate"}>{label}</span>}
      </Link>
    );
  };

  /* Barre mobile en bas : largeur fixe par icône, pas de fond gris, icône active en bleu */
  const mobileNavBar = (
    <aside
      className="fixed left-0 right-0 bottom-0 z-40 md:hidden flex flex-row items-stretch border-t pb-[env(safe-area-inset-bottom,0)] pt-2"
      style={{
        background: "var(--bpm-sidebar-bg)",
        color: "var(--bpm-sidebar-text)",
        borderColor: "var(--bpm-sidebar-border)",
        minHeight: "calc(56px + env(safe-area-inset-bottom, 0))",
        fontWeight: 400,
      }}
    >
      {navItems.map((item) => (
        <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} compact />
      ))}
    </aside>
  );

  return (
    <>
      {/* Mobile : barre en bas (grise, style doc) */}
      {mobileNavBar}

      {/* Desktop : sidebar verticale grise à gauche */}
      <aside
        className={`
          group bpm-app-sidebar
          fixed top-0 left-0 z-40 h-full flex flex-col
          w-64 transition-[width] duration-200 ease-in-out
          hidden md:flex
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
        style={{
          background: "var(--bpm-sidebar-bg)",
          color: "var(--bpm-sidebar-text)",
          borderRight: "1px solid var(--bpm-sidebar-border)",
          fontWeight: 400,
        }}
      >
        {/* Header : logo + collapse (style type PortfolioManagement : logo centré en haut) */}
        <div
          className="relative flex flex-col items-center justify-center px-4 py-5 border-b shrink-0"
          style={{ borderColor: "var(--bpm-sidebar-border)" }}
        >
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-full min-h-[2.5rem] gap-1">
            {collapsed ? (
              !logoError ? (
                <Image
                  src={logoSrc}
                  alt="Blueprint Modular"
                  width={32}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                  onError={handleLogoError}
                />
              ) : (
                <span className="font-bold text-sm truncate" style={{ color: LOGO_BLUE }}>BPM</span>
              )
            ) : (
              <>
                {!logoError ? (
                  <Image
                    src={logoSrc}
                    alt=""
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                ) : null}
                <span className="font-bold text-base tracking-tight">
                  <span style={{ color: LOGO_BLUE }}>Blueprint</span>
                  <span style={{ color: LOGO_CYAN }}> Modular</span>
                </span>
              </>
            )}
          </Link>
          <button
            type="button"
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bpm-sidebar-hover-bg)] transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 duration-200"
            style={{ color: "var(--bpm-sidebar-text)" }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Ouvrir" : "Réduire"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation avec titre "Navigation" */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {!collapsed && (
            <h3 className="text-xs font-normal uppercase tracking-wider mb-2 px-3" style={{ color: "var(--bpm-sidebar-text-muted)" }}>
              Navigation
            </h3>
          )}
          {navItems.map((item) => (
            <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* Bas : thème, utilisateur, déconnexion */}
        <div className="p-3 border-t shrink-0 space-y-2" style={{ borderColor: "var(--bpm-sidebar-border)" }}>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--bpm-sidebar-hover-bg)] transition"
            style={{ color: "var(--bpm-sidebar-text)" }}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span className="text-sm truncate">Thème</span>}
          </button>
          {session?.user && (
            <>
              <div className="flex items-center gap-3 px-1 py-1">
                {session.user.image ? (
                  <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full shrink-0 border-2" style={{ borderColor: "var(--bpm-sidebar-border)" }} />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white shrink-0" style={{ background: "var(--bpm-accent-cyan)" }}>
                    {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--bpm-sidebar-text)" }}>
                      {session.user.name ?? "Utilisateur"}
                    </p>
                    {session.user.email && (
                      <p className="text-xs truncate" style={{ color: "var(--bpm-sidebar-text-muted)" }}>
                        {session.user.email}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-normal transition border"
                  style={{
                    color: "var(--bpm-sidebar-text)",
                    background: "var(--bpm-bg-primary)",
                    borderColor: "var(--bpm-sidebar-logout-border)",
                  }}
                >
                  Se déconnecter
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
