"use client";

import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      {/* Bande grise à gauche (même gris que la sidebar, évite la bande blanche) */}
      <div
        className="hidden md:block fixed top-0 left-0 bottom-0 w-64 -z-10"
        style={{ background: "var(--bpm-sidebar-bg)" }}
        aria-hidden
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end px-4"
          style={{ background: "var(--bpm-bg-primary)" }}
        >
          <div className="flex items-center gap-1" style={{ color: "var(--bpm-text-primary)" }}>
            <NotificationBell />
          </div>
        </header>
        <main className="app-main flex-1 pt-4 pb-20 md:pb-4 px-4 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
