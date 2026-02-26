"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel } from "@/components/bpm";

export default function AssetManagerTicketsPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Domaine</Link> → Tickets
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Tickets
        </h1>
      </div>
      <Panel variant="info" title="En construction">
        La liste des tickets et la fiche détail seront implémentées dans une prochaine itération (API tickets GET déjà en place).
      </Panel>
      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Tableau de bord
        </Link>
      </nav>
    </div>
  );
}
