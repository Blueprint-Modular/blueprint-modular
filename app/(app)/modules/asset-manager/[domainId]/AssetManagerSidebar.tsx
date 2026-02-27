"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor, Ticket, UserCheck, FileText, BookOpen, RefreshCw, Network, ScrollText } from "lucide-react";

function IconDashboard({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} className={className} fill="currentColor">
      <path d="M120-200v-560h720v560H120Zm680-300v-220H160v220h640ZM375.38-240H800v-220H375.38v220ZM160-240h175.38v-220H160v220Z" />
    </svg>
  );
}

const ICON_SIZE = 20;

const ITEMS = [
  { key: "dashboard", label: "Tableau de bord", path: "", icon: <IconDashboard size={ICON_SIZE} /> },
  { key: "assets", label: "Équipements", path: "/assets", icon: <Monitor size={ICON_SIZE} /> },
  { key: "tickets", label: "Tickets", path: "/tickets", icon: <Ticket size={ICON_SIZE} /> },
  { key: "assignments", label: "Mise à disposition", path: "/assignments", icon: <UserCheck size={ICON_SIZE} /> },
  { key: "contracts", label: "Contrats", path: "/contracts", icon: <FileText size={ICON_SIZE} /> },
  { key: "knowledge", label: "Connaissances", path: "/knowledge", icon: <BookOpen size={ICON_SIZE} /> },
  { key: "changes", label: "Changements", path: "/changes", icon: <RefreshCw size={ICON_SIZE} /> },
  { key: "cmdb", label: "Cartographie CMDB", path: "/cmdb-graph", icon: <Network size={ICON_SIZE} /> },
  { key: "audit", label: "Journal d'audit", path: "/audit", icon: <ScrollText size={ICON_SIZE} /> },
] as const;

function getSectionFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("asset-manager");
  const segment = idx >= 0 && parts[idx + 2] ? parts[idx + 2] : "";
  if (!segment) return "dashboard";
  if (segment === "cmdb-graph") return "cmdb";
  if (segment === "audit") return "audit";
  const found = ITEMS.find((s) => s.path === `/${segment}`);
  return found ? found.key : "dashboard";
}

export function AssetManagerSidebar({ domainId }: { domainId: string }) {
  const pathname = usePathname();
  const current = getSectionFromPath(pathname ?? "");
  const basePath = `/modules/asset-manager/${domainId}`;

  return (
    <aside className="asset-manager-sidebar" aria-label="Navigation Gestion de parc">
      <nav className="asset-manager-sidebar-nav">
        {ITEMS.map((item) => {
          const href = item.path ? `${basePath}${item.path}` : basePath;
          const isActive = current === item.key;
          return (
            <Link
              key={item.key}
              href={href}
              className={`asset-manager-sidebar-link ${isActive ? "asset-manager-sidebar-link--active" : ""}`}
            >
              <span className="asset-manager-sidebar-link-icon flex-shrink-0" aria-hidden>
                {item.icon}
              </span>
              <span className="asset-manager-sidebar-link-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="asset-manager-sidebar-footer">
        <Link href="/modules" className="asset-manager-sidebar-link">
          Retour aux modules
        </Link>
        <Link href="/modules/asset-manager/documentation" className="asset-manager-sidebar-link">
          Documentation
        </Link>
      </div>
    </aside>
  );
}
