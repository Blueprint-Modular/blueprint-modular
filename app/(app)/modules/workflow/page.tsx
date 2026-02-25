"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Button, Badge } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Workflow</strong> gère des états et transitions (ex. brouillon → validé → archivé) avec historique des changements.
    </p>
    <CodeBlock code={'bpm.title("Workflow")\n# États : brouillon, validé, archivé. Transitions selon droits.'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>États et transitions (démo)</h2>
      <Panel variant="info" title="Document #42">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Statut :</span>
          <Badge variant="primary">Validé</Badge>
          <Button size="small" variant="outline">Archiver</Button>
        </div>
        <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Historique : Brouillon → Validé (par Alice, 24/02).</p>
      </Panel>
    </>
  );
}

export default function WorkflowModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Workflow</div>
        <h1>Workflow</h1>
        <p className="doc-description">États et transitions avec historique. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Processus & workflow</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/workflow/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
