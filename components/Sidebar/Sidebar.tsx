"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { SandboxIcon } from "@/components/icons/SandboxIcon";
import { useSidebar } from "@/contexts/SidebarContext";

const vb = "0 -960 960 960";

function IconAccueil({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="currentColor" className={className}>
      <path d="M540-600v-200h260v200H540ZM160-480v-320h260v320H160Zm380 320v-320h260v320H540Zm-380 0v-200h260v200H160Zm40-360h180v-240H200v240Zm380 320h180v-240H580v240Zm0-440h180v-120H580v120ZM200-200h180v-120H200v120Zm180-320Zm200-120Zm0 200ZM380-320Z" />
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

function IconParametres({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill="currentColor" className={className}>
      <path d="m405.38-120-14.46-115.69q-19.15-5.77-41.42-18.16-22.27-12.38-37.88-26.53L204.92-235l-74.61-130 92.23-69.54q-1.77-10.84-2.92-22.34-1.16-11.5-1.16-22.35 0-10.08 1.16-21.19 1.15-11.12 2.92-25.04L130.31-595l74.61-128.46 105.93 44.61q17.92-14.92 38.77-26.92 20.84-12 40.53-18.54L405.38-840h149.24l14.46 116.46q23 8.08 40.65 18.54 17.65 10.46 36.35 26.15l109-44.61L829.69-595l-95.31 71.85q3.31 12.38 3.7 22.73.38 10.34.38 20.42 0 9.31-.77 19.65-.77 10.35-3.54 25.04L827.92-365l-74.61 130-107.23-46.15q-18.7 15.69-37.62 26.92-18.92 11.23-39.38 17.77L554.62-120H405.38ZM440-160h78.23L533-268.31q30.23-8 54.42-21.96 24.2-13.96 49.27-38.27L736.46-286l39.77-68-87.54-65.77q5-17.08 6.62-31.42 1.61-14.35 1.61-28.81 0-15.23-1.61-28.81-1.62-13.57-6.62-29.88L777.77-606 738-674l-102.08 42.77q-18.15-19.92-47.73-37.35-29.57-17.42-55.96-23.11L520-800h-79.77l-12.46 107.54q-30.23 6.46-55.58 20.81-25.34 14.34-50.42 39.42L222-674l-39.77 68L269-541.23q-5 13.46-7 29.23t-2 32.77q0 15.23 2 30.23t6.23 29.23l-86 65.77L222-286l99-42q23.54 23.77 48.88 38.12 25.35 14.34 57.12 22.34L440-160Zm38.92-220q41.85 0 70.93-29.08 29.07-29.07 29.07-70.92t-29.07-70.92Q520.77-580 478.92-580q-42.07 0-71.04 29.08-28.96 29.07-28.96 70.92t28.96 70.92Q436.85-380 478.92-380ZM480-480Z" />
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

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: IconAccueil },
  { href: "/docs/components", label: "Composants", icon: IconComposants },
  { href: "/modules", label: "Modules", icon: IconModules },
  { href: "/sandbox", label: "Sandbox", icon: SandboxIcon },
  { href: "/demo", label: "Demo", icon: IconDemo },
  { href: "/settings", label: "Paramètres", icon: IconParametres },
];

const LOGO_CANDIDATES = ["/img/logo-bpm.png", "/img/logo-bpm-nom.jpg", "/img/logo-bpm-nom.png"];
/** Couleurs fixes du logo (ne varient pas avec le wizard / couleur d'accent) */
const LOGO_BLUE = "#1a4b8f";
const LOGO_CYAN = "#00a3e0";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const sidebarCtx = useSidebar();
  const collapsed = sidebarCtx?.collapsed ?? false;
  const setCollapsed = sidebarCtx?.setCollapsed ?? (() => {});
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

  /* Barre mobile en bas : sans Accueil (on est déjà sur l'app, pas besoin du lien Accueil) */
  const mobileNavItems = navItems.filter((item) => item.href !== "/dashboard");
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
      {mobileNavItems.map((item) => (
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
          className="relative flex flex-col items-center justify-center px-4 pb-5 shrink-0"
          style={{ paddingTop: "2.5rem" }}
        >
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-full min-h-[2.5rem] gap-1">
            {collapsed ? (
              !logoError ? (
                <Image
                  src={logoSrc}
                  alt="Blueprint Modular"
                  width={80}
                  height={80}
                  className="h-20 w-auto object-contain"
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
                    alt="Blueprint Modular"
                    width={300}
                    height={100}
                    className="h-[6.25rem] w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                ) : null}
                <span className="font-bold text-xl tracking-tight">
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

        {/* Navigation principale */}
        <nav className="flex-1 overflow-y-auto p-3 pt-10 space-y-0.5" aria-label="Navigation principale">
          {!collapsed && (
            <span className="block text-xs font-normal uppercase tracking-wider mb-2 px-3" style={{ color: "var(--bpm-sidebar-text-muted)" }}>
              Navigation
            </span>
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
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <IconThemeDark className="w-5 h-5 shrink-0" />}
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
