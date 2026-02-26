"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Tabs, Breadcrumb } from "@/components/bpm";

const SECTIONS = [
  { key: "dashboard", label: "Tableau de bord", path: "" },
  { key: "assets", label: "Équipements", path: "/assets" },
  { key: "tickets", label: "Tickets", path: "/tickets" },
  { key: "assignments", label: "Mises à disposition", path: "/assignments" },
  { key: "contracts", label: "Contrats", path: "/contracts" },
  { key: "knowledge", label: "Base de connaissances", path: "/knowledge" },
  { key: "changes", label: "Changements", path: "/changes" },
] as const;

function getSectionFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("asset-manager");
  const segment = idx >= 0 && parts[idx + 2] ? parts[idx + 2] : ""; // after asset-manager, domainId, then section
  if (!segment) return "dashboard";
  const found = SECTIONS.find((s) => s.path === `/${segment}`);
  return found ? found.key : "dashboard";
}

export function AssetManagerNav({
  breadcrumbItems,
}: {
  breadcrumbItems: { label: string; href?: string }[];
}) {
  const pathname = usePathname();
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const basePath = `/modules/asset-manager/${domainId}`;
  const currentSection = getSectionFromPath(pathname ?? "");

  const tabIndex = SECTIONS.findIndex((s) => s.key === currentSection);
  const tabs = SECTIONS.map((s) => ({
    label: s.label,
    content: null as React.ReactNode,
    key: s.key,
  }));

  const handleTabChange = (index: number) => {
    const path = SECTIONS[index]?.path ?? "";
    window.location.href = path ? `${basePath}${path}` : basePath;
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-1" />
      <Tabs
        tabs={tabs}
        defaultTab={tabIndex >= 0 ? tabIndex : 0}
        onChange={handleTabChange}
        className="mb-3"
      />
    </>
  );
}
