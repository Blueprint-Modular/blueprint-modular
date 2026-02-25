"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Table, Button } from "@/components/bpm";

const refData = [{ code: "EUR", libelle: "Euro" }, { code: "USD", libelle: "Dollar US" }];

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      CRUD pour listes métier (devises, pays, types) utilisables dans les formulaires.
    </p>
    <CodeBlock code={'bpm.title("Référentiels")\nbpm.table(columns=cols, data=ref)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Devises (démo)">
      <Table columns={[{ key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }]} data={refData} striped hover />
      <Button size="small" className="mt-4">Ajouter</Button>
    </Panel>
  );
}

export default function ReferentielsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Référentiels</div>
        <h1>Référentiels</h1>
        <p className="doc-description">CRUD listes métier. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Données & reporting</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/referentiels/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
