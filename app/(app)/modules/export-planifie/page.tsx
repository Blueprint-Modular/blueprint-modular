"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Envoi périodique par email de rapports ou exports (PDF/CSV). Planification (quotidien, hebdo, mensuel) et liste de destinataires.
    </p>
    <CodeBlock code={'bpm.title("Export planifié")\n# Fréquence + rapport + destinataires'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Configurer un export planifié">
      <Selectbox options={[{ value: "daily", label: "Quotidien" }, { value: "weekly", label: "Hebdomadaire" }]} value={null} onChange={() => {}} placeholder="Fréquence" label="Fréquence" />
      <Input label="Email(s) destinataires" placeholder="a@b.com, c@d.com" value="" onChange={() => {}} className="mt-4" />
      <Button className="mt-4">Enregistrer</Button>
    </Panel>
  );
}

export default function ExportPlanifieModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Export planifié</div>
        <h1>Export planifié</h1>
        <p className="doc-description">Envoi périodique par email de rapports ou exports (PDF/CSV).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Données & reporting</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/export-planifie/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
