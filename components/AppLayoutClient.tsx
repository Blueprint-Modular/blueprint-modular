"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

function getBreadcrumbFromPathname(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  if (segments[0] === "docs" && segments[1] === "components") {
    const slug = segments[2];
    if (slug) return [{ label: "Composants", href: "/docs/components" }, { label: `bpm.${slug}` }];
    return [{ label: "Composants" }];
  }
  if (segments[0] === "modules") {
    if (segments.length === 1) return [{ label: "Modules" }];
    const second = segments[1];
    const labels: Record<string, string> = {
      auth: "bpm.auth",
      notification: "bpm.notification",
      wiki: "Module Wiki",
      ia: "Module IA",
      veille: "Module Veille",
      documents: "Module Documents",
      ibkr: "Module IBKR",
      "analyse-document": "Module Documents",
    };
    return [
      { label: "Modules", href: "/modules" },
      { label: labels[second] ?? second },
    ];
  }
  if (segments[0] === "settings") return [{ label: "Paramètres" }];
  if (segments[0] === "dashboard") return [{ label: "Dashboard" }];
  if (segments[0] === "sandbox") return [{ label: "Sandbox" }];
  return [];
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbFromPathname(pathname ?? "");

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
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between px-4"
          style={{ background: "var(--bpm-bg-primary)" }}
        >
          <nav aria-label="Fil d'Ariane" className="doc-breadcrumb doc-breadcrumb-header text-sm truncate min-w-0">
            {breadcrumbItems.length > 0 ? (
              <>
                {breadcrumbItems.map((item, i) => (
                  <span key={i}>
                    {i > 0 && <span className="opacity-70"> → </span>}
                    {item.href ? (
                      <Link href={item.href} className="hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                        {item.label}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--bpm-text-secondary)" }}>{item.label}</span>
                    )}
                  </span>
                ))}
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </nav>
          <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--bpm-text-primary)" }}>
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
