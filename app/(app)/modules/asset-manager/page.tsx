"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Panel, Button, Spinner } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

export default function AssetManagerPage() {
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/asset-manager/config", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { domainIds: [] }))
      .then((data: { domainIds?: string[] }) => {
        setDomainIds(Array.isArray(data.domainIds) ? data.domainIds : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Gestion d’actifs
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Gestion d’actifs
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Choisissez un domaine pour gérer les actifs, tickets et mises à disposition. Configuration pilotée par domaine (IT, Maintenance, etc.).
        </p>
      </div>

      {domainIds.length === 0 ? (
        <Panel variant="info" title="Aucun domaine">
          Aucune configuration de domaine disponible. Vérifiez les fichiers <code>lib/asset-manager/config/domain.*.json</code>.
        </Panel>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {domainIds.map((domainId) => (
            <DomainCard key={domainId} domainId={domainId} />
          ))}
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour aux modules
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}

function DomainCard({ domainId }: { domainId: string }) {
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .finally(() => setLoading(false));
  }, [domainId]);

  if (loading) return <Panel variant="info" title="…">Chargement…</Panel>;
  if (!config) return <Panel variant="warning" title={domainId}>Config introuvable</Panel>;

  return (
    <Panel variant="info" title={config.domain_label}>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {config.asset_label_plural}, {config.ticket_label_singular}s, {config.assignment_label}s.
      </p>
      <Link href={`/modules/asset-manager/${domainId}`}>
        <Button variant="primary">Ouvrir</Button>
      </Link>
    </Panel>
  );
}
