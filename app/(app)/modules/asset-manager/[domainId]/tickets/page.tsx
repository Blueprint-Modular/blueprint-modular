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
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> → Tickets
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Tickets
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Suivi des tickets et demandes d&apos;intervention.
        </p>
      </div>
      <Panel variant="info" title="En construction">
        La liste des tickets et la fiche détail seront implémentées dans une prochaine itération (API tickets GET déjà en place).
      </Panel>
      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Tableau de bord
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
