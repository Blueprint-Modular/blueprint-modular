"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Création de rapports à partir de données : sélection de champs, filtres et graphiques prédéfinis. Export PDF ou CSV.
    </p>
    <CodeBlock code={'bpm.title("Rapports")\nbpm.selectbox(options=types_rapport, label="Type")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <Panel variant="info" title="Générer un rapport">
        <Selectbox options={[{ value: "ca", label: "CA par mois" }, { value: "cmd", label: "Commandes" }]} value={null} onChange={() => {}} placeholder="Type de rapport" label="Type" />
        <Button className="mt-4">Générer</Button>
      </Panel>
    </>
  );
}

export default function RapportsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Rapports</div>
        <h1>Rapports</h1>
        <p className="doc-description">Création de rapports (champs, filtres, graphiques). Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Données & reporting</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/rapports/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
