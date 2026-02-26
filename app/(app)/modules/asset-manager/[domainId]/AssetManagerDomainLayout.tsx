"use client";

import { AssetManagerSidebar } from "./AssetManagerSidebar";

export function AssetManagerDomainLayout({
  domainId,
  children,
}: {
  domainId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="asset-manager-layout">
      <AssetManagerSidebar domainId={domainId} />
      <main className="asset-manager-main">{children}</main>
    </div>
  );
}
