"use client";

import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end border-b px-4"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <div className="flex items-center gap-1" style={{ color: "var(--bpm-text-primary)" }}>
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 pt-4 pb-20 md:pb-4 px-4 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
