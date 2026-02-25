"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Metric, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Tableaux de bord personnalisables : disposition de widgets (métriques, graphiques, tableaux) par l&apos;utilisateur.
    </p>
    <CodeBlock code={'bpm.title("Mon tableau de bord")\nbpm.metric("CA", 142500, delta=3200)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <Panel variant="info" title="Vue démo">
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          <Metric label="CA (k€)" value={142.5} delta={12.3} />
          <Metric label="Commandes" value={1248} />
        </div>
        <Button size="small" variant="outline">Personnaliser les widgets</Button>
      </Panel>
    </>
  );
}

export default function TableauxDeBordModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Tableaux de bord</div>
        <h1>Tableaux de bord</h1>
        <p className="doc-description">Disposition de widgets par l&apos;utilisateur. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Données & reporting</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/tableaux-de-bord/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
