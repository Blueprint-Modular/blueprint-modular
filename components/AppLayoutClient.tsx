"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { ModuleRegistryInit } from "@/components/ai/ModuleRegistryInit";
import { AssistantProvider } from "@/lib/ai/assistant-context";
import { APP_VERSION } from "@/lib/version";
import { AIHeaderProvider, useAIHeader } from "@/contexts/AIHeaderContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { AssetManagerSidebar } from "@/app/(app)/modules/asset-manager/[domainId]/AssetManagerSidebar";

const ASSISTANT_NAME = "Assistant";

function AIHeaderIconButtons() {
  const pathname = usePathname();
  const ctx = useAIHeader();
  const isIAPage = pathname === "/modules/ia";
  if (!isIAPage || !ctx) return null;
  const iconBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    padding: 0,
    borderRadius: 8,
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-primary)",
    cursor: "pointer",
  } as const;
  return (
    <>
      <button
        type="button"
        onClick={() => ctx.triggerNewDiscussion()}
        aria-label="Nouvelle discussion"
        title="Nouvelle discussion"
        style={iconBtnStyle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
          <path d="m98.46-98.46 62.62-212.62q-19-40.23-30.04-82.47T120-480q0-74.7 28.34-140.4t76.92-114.3q48.58-48.6 114.26-76.95Q405.19-840 479.87-840q74.67 0 140.41 28.34 65.73 28.34 114.36 76.92 48.63 48.58 76.99 114.26Q840-554.81 840-480.13q0 74.67-28.35 140.41-28.35 65.73-76.95 114.36-48.6 48.63-114.3 76.99Q554.7-120 480-120q-44.21 0-86.45-11.04t-82.47-30.04L98.46-98.46ZM158-158l128-38q15.54-4 28.5-3.77 12.96.23 27.5 7.77 32 16 67 24t71 8q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 36 8 71t24 67q7 13 7.88 27.5.89 14.5-3.88 28.5l-38 128Zm302-182h40v-120h120v-40H500v-120h-40v120H340v40h120v120Zm19-139Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => ctx.setHistoryOpen(!ctx.historyOpen)}
        aria-label={`Historique des échanges avec ${ASSISTANT_NAME}`}
        title="Historique"
        style={iconBtnStyle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
          <path d="M208.73-548.69q-8.73-8.68-8.73-21.27 0-12.58 8.69-21.31 8.68-8.73 21.27-8.73 12.58 0 21.31 8.69 8.73 8.68 8.73 21.27 0 12.58-8.69 21.31-8.69 8.73-21.27 8.73t-21.31-8.69Zm500 0q-8.73-8.68-8.73-21.27 0-12.58 8.69-21.31 8.69-8.73 21.27-8.73t21.31 8.69q8.73 8.68 8.73 21.27 0 12.58-8.69 21.31-8.68 8.73-21.27 8.73-12.58 0-21.31-8.69ZM80-460Zm800 0ZM160-120h-40v-120h160q-58.31 0-99.15-40.85Q140-321.69 140-380h40q0 41.25 29.37 70.62Q238.75-280 280-280v-160h108l-38-155q-23-92-98.5-148.5T80-800v-40q109.92 0 195.88 64.92 85.97 64.93 112.66 170.85l41.47 164.17q3.99 15.21-6.09 27.64Q413.85-400 398.46-400H320v135.38q0 26.66-18.98 45.64T255.38-200H160v80Zm680 0h-40v-80h-95.38q-26.66 0-45.64-18.98T640-264.62V-400h-78.46q-15.39 0-25.46-12.54-10.08-12.54-5.62-27.92l41-163.77q27.39-105 112.77-170.39Q769.62-840 880-840v40q-95.77 0-171.27 56.62-75.5 56.61-98.5 148.38L572-440h108v160q41.46-.77 70.73-29.65Q780-338.54 780-380h40q0 58.31-40.85 98.77Q738.31-240.77 680-240h160v120ZM320-240v-40 40Zm320 0v-40 40Z" />
        </svg>
      </button>
    </>
  );
}

const ASSET_MANAGER_PATH = /^\/modules\/asset-manager\/([^/]+)/;
const SECONDARY_SIDEBAR_TRANSITION_MS = 250;

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();
  const collapsed = sidebar?.collapsed ?? false;
  const pathname = usePathname();
  const hasSecondarySidebar = ASSET_MANAGER_PATH.test(pathname ?? "");
  const domainId = (pathname ?? "").match(ASSET_MANAGER_PATH)?.[1] ?? "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const prevHasSecondary = useRef(hasSecondarySidebar);

  useEffect(() => {
    if (hasSecondarySidebar) {
      prevHasSecondary.current = true;
      const raf = requestAnimationFrame(() => setSidebarOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    if (prevHasSecondary.current) {
      prevHasSecondary.current = false;
      setIsClosing(true);
      const raf = requestAnimationFrame(() => setSidebarOpen(false));
      const t = setTimeout(() => setIsClosing(false), SECONDARY_SIDEBAR_TRANSITION_MS);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }
    setSidebarOpen(false);
  }, [hasSecondarySidebar]);

  const showSecondarySidebar = hasSecondarySidebar || isClosing;
  const secondarySidebarMargin = sidebarOpen && showSecondarySidebar;

  return (
    <div
      className="app-layout-root min-h-screen flex"
      style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
      data-secondary-sidebar-open={secondarySidebarMargin ? "true" : "false"}
    >
      {/* Bande grise à gauche : largeur = sidebar (64 ou 16) pour éviter bande blanche quand réduite */}
      <div
        className={`hidden md:block fixed top-0 left-0 bottom-0 -z-10 transition-[width] duration-200 ease-in-out ${collapsed ? "w-16" : "w-64"}`}
        style={{ background: "var(--bpm-sidebar-bg)" }}
        aria-hidden
      />
      <Sidebar />
      {/* Sidebar secondaire : décalée à droite de la sidebar principale (transition synchronisée) */}
      {showSecondarySidebar && domainId && (
        <div
          className={`asset-manager-sidebar-outer hidden md:block overflow-hidden transition-[margin-left] duration-200 ease-in-out ${collapsed ? "md:ml-16" : "md:ml-64"} ${secondarySidebarMargin ? "asset-manager-sidebar-outer--open" : ""}`}
          aria-hidden={!sidebarOpen}
        >
          <AssetManagerSidebar domainId={domainId} />
        </div>
      )}
      <div
        className={`app-content-column flex-1 flex flex-col min-h-screen transition-[margin-left] duration-200 ease-in-out ${collapsed ? "md:ml-16" : "md:ml-64"}`}
      >
          <header
            className="pwa-title-bar sticky top-0 z-30 max-md:z-50 flex h-14 shrink-0 items-center justify-end px-3 sm:px-4 gap-2"
            style={{ background: "var(--bpm-bg-primary)" }}
          >
            <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--bpm-text-primary)" }}>
              <AIHeaderIconButtons />
              <NotificationBell />
            </div>
          </header>
          <main id="main-content" className="app-main flex-1 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-4 px-3 sm:px-4 min-h-0" role="main">
            {children}
          </main>
          <footer
            className="max-md:hidden md:block shrink-0 py-4 px-3 sm:px-4 border-t text-sm"
            style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}
            role="contentinfo"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1400px] mx-auto">
              <span>Blueprint Modular v{APP_VERSION}</span>
              <span className="flex flex-wrap gap-4">
                <a href="https://docs.blueprint-modular.com/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--bpm-color-link)" }}>Documentation</a>
                <a href="https://pypi.org/project/blueprint-modular/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--bpm-color-link)" }}>PyPI</a>
                <a href="/dashboard" className="hover:underline" style={{ color: "var(--bpm-color-link)" }}>Accueil</a>
              </span>
            </div>
          </footer>
        </div>
      <AssistantProvider>
        <ModuleRegistryInit />
        <AIAssistant />
      </AssistantProvider>
    </div>
  );
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AIHeaderProvider>
      <SidebarProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </SidebarProvider>
    </AIHeaderProvider>
  );
}
