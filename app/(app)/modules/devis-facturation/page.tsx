"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Table, Button, Badge } from "@/components/bpm";

const lignes = [{ designation: "Prestation A", qté: "1", pu: "1000", total: "1000" }];

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Lignes, totaux, PDF, statuts (brouillon, envoyé, payé).
    </p>
    <CodeBlock code={'bpm.title("Devis / Facturation")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Devis #2025-001 (démo)">
      <div className="flex gap-2 mb-4"><Badge variant="warning">Brouillon</Badge><Button size="small">Envoyer</Button><Button size="small" variant="outline">PDF</Button></div>
      <Table columns={[{ key: "designation", label: "Désignation" }, { key: "qté", label: "Qté" }, { key: "pu", label: "P.U." }, { key: "total", label: "Total" }]} data={lignes} striped hover />
      <p className="text-sm mt-4" style={{ color: "var(--bpm-text-primary)" }}>Total TTC : 1000</p>
    </Panel>
  );
}

export default function DevisFacturationModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Devis / Facturation</div>
        <h1>Devis / Facturation</h1>
        <p className="doc-description">Lignes, totaux, PDF, statuts. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Métier</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/devis-facturation/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
