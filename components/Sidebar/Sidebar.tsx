"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun } from "lucide-react";
import { useState } from "react";
import { SandboxIcon } from "@/components/icons/SandboxIcon";
import { useSidebar } from "@/contexts/SidebarContext";

const vb = "0 -960 960 960";

function IconAccueil({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className={className}>
      <path d="M480-790.77 760-580v420H200v-420l280-210.77Zm70.77 381.63Q580-438.28 580-479.91q0-41.63-29.14-70.86Q521.72-580 480.09-580q-41.63 0-70.86 29.14Q380-521.72 380-480.09q0 41.63 29.14 70.86Q438.28-380 479.91-380q41.63 0 70.86-29.14Zm-113.12-28.51Q420-455.31 420-480t17.65-42.35Q455.31-540 480-540t42.35 17.65Q540-504.69 540-480t-17.65 42.35Q504.69-420 480-420t-42.35-17.65ZM477.94-260q-51.25 0-99.48 15.38-48.23 15.39-90.92 44.62h381.08q-41.93-29.23-90.68-44.62-48.75-15.38-100-15.38ZM240-560v347.69q50.46-42.07 111.21-64.88Q411.96-300 477.69-300q67.08 0 129.08 22.42 62 22.43 113.23 64.5V-560L480-740 240-560Zm240 80Z" />
    </svg>
  );
}

function IconComposants({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="currentColor" className={className}>
      <path d="M120-120v-203.08h203.08V-120H120Zm258.46 0v-203.08h203.08V-120H378.46Zm258.46 0v-203.08H840V-120H636.92ZM120-378.46v-203.08h203.08v203.08H120Zm258.46 0v-203.08h203.08v203.08H378.46Zm258.46 0v-203.08H840v203.08H636.92ZM120-636.92V-840h461.54v203.08H120Zm516.92 0V-840H840v203.08H636.92ZM283.08-283.08Zm135.38 0h123.08-123.08Zm258.46 0ZM283.08-418.46v-123.08 123.08ZM480-480Zm196.92 61.54v-123.08 123.08Zm0-258.46ZM160-160h123.08v-123.08H160V-160Zm258.46 0h123.08v-123.08H418.46V-160Zm258.46 0H800v-123.08H676.92V-160ZM160-418.46h123.08v-123.08H160v123.08Zm258.46 0h123.08v-123.08H418.46v123.08Zm258.46 0H800v-123.08H676.92v123.08Zm0-258.46H800V-800H676.92v123.08Z" />
    </svg>
  );
}

function IconModules({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="currentColor" className={className}>
      <path d="M120-200v-411.54h113.08V-760h191.54v148.46h110.76V-760h191.54v148.46H840V-200H120Zm40-40h640v-331.54H160V-240Zm113.08-371.54h111.54V-720H273.08v108.46Zm302.3 0h111.54V-720H575.38v108.46ZM160-240h640-640Zm113.08-371.54h111.54-111.54Zm302.3 0h111.54-111.54Z" />
    </svg>
  );
}

function IconThemeDark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="currentColor" className={className}>
      <path d="M484-120q-75.61 0-141.77-28.54-66.15-28.54-115.65-78.04-49.5-49.5-78.04-115.65Q120-408.39 120-484q0-116.77 67.23-210.58 67.23-93.81 177.39-130.8-4.16 93.61 28.69 180.03 32.84 86.43 99.23 152.81 66.38 66.39 152.81 99.23 86.42 32.85 180.03 28.69-36.76 110.16-130.69 177.39Q600.77-120 484-120Zm0-40q88 0 163-44t118-121.21q-86-8.03-163-43.62-77-35.6-138-96.77-61-61.17-97-137.78Q331-680 324-766q-77 43-120.5 118.5T160-484q0 135 94.5 229.5T484-160Zm-20-305.77Z" />
    </svg>
  );
}

function IconDemo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
      <path d="M400-336.92 623.08-480 400-623.08v286.16ZM480.13-120q-74.67 0-140.41-28.34-65.73-28.34-114.36-76.92-48.63-48.58-76.99-114.26Q120-405.19 120-479.87q0-74.67 28.34-140.41 28.34-65.73 76.92-114.36 48.58-48.63 114.26-76.99Q405.19-840 479.87-840q74.67 0 140.41 28.34 65.73 28.34 114.36 76.92 48.63 48.58 76.99 114.26Q840-554.81 840-480.13q0 74.67-28.34 140.41-28.34 65.73-76.92 114.36-48.58 48.63-114.26 76.99Q554.81-120 480.13-120Zm-.13-40q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
  );
}

/* Flèches ouverture/fermeture sidebar : même forme que .Maker (20×20) */
function IconSidebarChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden>
      <path d="M560-267.69 347.69-480 560-692.31 588.31-664l-184 184 184 184L560-267.69Z" />
    </svg>
  );
}
function IconSidebarChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden>
      <path d="m531.69-480-184-184L376-692.31 588.31-480 376-267.69 347.69-296l184-184Z" />
    </svg>
  );
}

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: IconAccueil },
  { href: "/docs/components", label: "Composants", icon: IconComposants },
  { href: "/modules", label: "Modules", icon: IconModules },
  { href: "/sandbox", label: "Sandbox", icon: SandboxIcon },
  { href: "/demo", label: "Demo", icon: IconDemo },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const sidebarCtx = useSidebar();
  const collapsed = sidebarCtx?.collapsed ?? false;
  const setCollapsed = sidebarCtx?.setCollapsed ?? (() => {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

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
        className={`bpm-sidebar-item ${compact ? "flex-col gap-0.5 py-2 min-w-0 rounded-lg flex-1 basis-0 justify-center items-center" : ""}`}
        style={compact ? undefined : { background: isActive ? "var(--bpm-sidebar-active-bg)" : "transparent" }}
        title={compact ? label : undefined}
      >
        <span className={compact ? "shrink-0 inline-flex items-center justify-center w-5 h-5" : "bpm-sidebar-icon-wrap"}>
          <Icon className="w-5 h-5" style={{ width: 20, height: 20 }} />
        </span>
        {showLabel && <span className={compact ? "text-xs font-normal truncate max-w-full text-center" : "bpm-sidebar-item-label"}>{label}</span>}
      </Link>
    );
  };

  /* Barre mobile / PWA en bas : tous les liens dont Accueil */
  const mobileNavBar = (
    <aside
      aria-label="Navigation mobile"
      className="fixed left-0 right-0 bottom-0 z-40 md:hidden flex flex-row items-stretch border-t pb-[env(safe-area-inset-bottom,0)] pt-2 bpm-mobile-nav-bar"
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

      {/* Desktop : sidebar verticale (présentation alignée .Maker ; border/background Modular) */}
      <aside
        className={`
          bpm-app-sidebar
          fixed top-0 left-0 z-50 h-full flex flex-col
          hidden md:flex
          ${collapsed ? "md:w-[56px] md:min-w-[56px]" : "md:w-[220px] md:min-w-[220px]"}
        `}
        style={{
          background: "var(--bpm-sidebar-bg)",
          borderRight: "1px solid var(--bpm-sidebar-border)",
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="bpm-sidebar-toggle-row shrink-0">
          {!collapsed && (
            <Link href="/dashboard" className="bpm-sidebar-title">
              <span className="bpm-sidebar-item-label">.Modular</span>
            </Link>
          )}
          <button
            type="button"
            className={`bpm-sidebar-toggle-btn ${sidebarHovered ? "bpm-sidebar-toggle-btn-visible" : ""} focus:opacity-100 focus-visible:opacity-100`}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
          >
            {collapsed ? <IconSidebarChevronRight /> : <IconSidebarChevronLeft />}
          </button>
        </div>

        <nav className="bpm-sidebar-nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        <div className="bpm-sidebar-footer-wrap border-t shrink-0 space-y-2" style={{ borderColor: "var(--bpm-sidebar-border)" }}>
          <button
            type="button"
            className="bpm-sidebar-item w-full"
            onClick={toggleTheme}
          >
            <span className="bpm-sidebar-icon-wrap">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <IconThemeDark className="w-5 h-5" />}
            </span>
            <span className="bpm-sidebar-item-label">Thème</span>
          </button>
          {session?.user && (
            <>
              <div className="flex items-center gap-3 px-1 py-1" data-sidebar-user>
                {session.user.image ? (
                  <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full shrink-0 border-2" style={{ borderColor: "var(--bpm-sidebar-border)" }} />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white shrink-0" style={{ background: "var(--bpm-accent-cyan)" }}>
                    {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate bpm-sidebar-item-label">
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
                  className="w-full py-2 px-3 rounded-[6px] text-[14px] font-normal transition-[background-color,border-color] duration-150 ease-out border"
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
