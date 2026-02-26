"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

type Asset = {
  id: string;
  reference: string;
  label: string;
  assetTypeId: string;
  statusId: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
  attributes: { key: string; valueText?: string | null; valueNumber?: number | null; valueDate?: string | null; valueBool?: boolean | null }[];
  createdBy?: { name?: string | null } | null;
};

export default function AssetDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, a]) => {
        setConfig(cfg);
        setAsset(a);
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const getStatusLabel = (sid: string) => config?.statuses.find((s) => s.id === sid)?.label ?? sid;
  const getTypeLabel = (tid: string) => config?.asset_types.find((t) => t.id === tid)?.label ?? tid;

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link>
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Gestion d&apos;actifs</h1>
        </div>
        <Panel variant="warning" title="Actif introuvable">
          L&apos;actif demandé n&apos;existe pas ou vous n&apos;y avez pas accès.
        </Panel>
        <nav className="doc-pagination mt-6">
          <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à la liste</Link>
        </nav>
      </div>
    );
  }

  const attrsByKey = Object.fromEntries(asset.attributes.map((a) => [a.key, a]));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/assets`}>{config?.asset_label_plural ?? "Actifs"}</Link> → {asset.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {asset.label}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {asset.reference} — {getTypeLabel(asset.assetTypeId)} — {getStatusLabel(asset.statusId)}
        </p>
      </div>

      <Panel variant="info" title="Informations générales">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Référence</dt>
          <dd>{asset.reference}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Type</dt>
          <dd>{getTypeLabel(asset.assetTypeId)}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Statut</dt>
          <dd>{getStatusLabel(asset.statusId)}</dd>
          {asset.brand && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>Marque</dt>
              <dd>{asset.brand}</dd>
            </>
          )}
          {asset.model && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>Modèle</dt>
              <dd>{asset.model}</dd>
            </>
          )}
          {asset.serialNumber && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>N° série</dt>
              <dd>{asset.serialNumber}</dd>
            </>
          )}
        </dl>
      </Panel>

      {config?.asset_types && asset.attributes.length > 0 && (
        <Panel variant="info" title="Caractéristiques" className="mt-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {config.asset_types
              .find((t) => t.id === asset.assetTypeId)
              ?.fields.filter((f) => attrsByKey[f.key])
              .map((f) => {
                const a = attrsByKey[f.key];
                let val = "";
                if (a?.valueText != null) val = a.valueText;
                else if (a?.valueNumber != null) val = String(a.valueNumber);
                else if (a?.valueDate) val = new Date(a.valueDate).toLocaleDateString("fr-FR");
                else if (a?.valueBool != null) val = a.valueBool ? "Oui" : "Non";
                return (
                  <span key={f.key} className="col-span-2 md:col-span-1 flex gap-2">
                    <dt style={{ color: "var(--bpm-text-secondary)", minWidth: "8rem" }}>{f.label}</dt>
                    <dd>{val}</dd>
                  </span>
                );
              })}
          </dl>
        </Panel>
      )}

      {asset.notes && (
        <Panel variant="info" title="Notes" className="mt-4">
          <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Liste des actifs
        </Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          Tableau de bord
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
