"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, ColorPicker, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Choix de thème, logo et couleurs par instance ou client (white-label).
    </p>
    <CodeBlock code={'bpm.title("Themes")\n# Couleur accent, logo, nom'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Personnalisation (démo)">
      <ColorPicker value="#00a3e0" onChange={() => {}} label="Couleur d'accent" />
      <Input label="Nom de l'app" placeholder="Mon app" value="" onChange={() => {}} className="mt-4" />
      <Button className="mt-4">Enregistrer</Button>
    </Panel>
  );
}

export default function ThemesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Thèmes</div>
        <h1>Thèmes / White-label</h1>
        <p className="doc-description">Choix de thème, logo et couleurs par instance ou client. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Intégrations & technique</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/themes/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
