"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Panel, Spinner } from "@/components/bpm";

const DEFAULT_DOMAIN_ID = "it";

export default function AssetManagerPage() {
  const router = useRouter();
  const [noDomain, setNoDomain] = useState(false);

  useEffect(() => {
    fetch("/api/asset-manager/config", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { domainIds: [] }))
      .then((data: { domainIds?: string[] }) => {
        const ids = Array.isArray(data.domainIds) ? data.domainIds : [];
        const target = ids.includes(DEFAULT_DOMAIN_ID) ? DEFAULT_DOMAIN_ID : ids[0];
        if (target) {
          router.replace(`/modules/asset-manager/${target}`);
        } else {
          setNoDomain(true);
        }
      })
      .catch(() => setNoDomain(true));
  }, [router]);

  if (!noDomain) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → Gestion d&apos;actifs
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            Gestion d&apos;actifs
          </h1>
          <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Chargement…
          </p>
        </div>
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Gestion d&apos;actifs
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Gestion d&apos;actifs
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Aucune configuration de domaine disponible.
        </p>
      </div>
      <Panel variant="warning" title="Configuration requise">
        Aucun domaine n&apos;est configuré. Vérifiez les fichiers <code>lib/asset-manager/config/domain.*.json</code>.
      </Panel>
      <nav className="doc-pagination mt-6">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour aux modules</Link>
      </nav>
    </div>
  );
}
