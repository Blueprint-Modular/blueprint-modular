"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { key: "dashboard", label: "Tableau de bord", path: "" },
  { key: "assets", label: "Équipements", path: "/assets" },
  { key: "tickets", label: "Tickets", path: "/tickets" },
  { key: "assignments", label: "Mise à disposition", path: "/assignments" },
  { key: "contracts", label: "Contrats", path: "/contracts" },
  { key: "knowledge", label: "Connaissances", path: "/knowledge" },
  { key: "changes", label: "Changements", path: "/changes" },
  { key: "cmdb", label: "Cartographie CMDB", path: "/cmdb-graph" },
  { key: "audit", label: "Journal d'audit", path: "/audit" },
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
              {item.label}
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
