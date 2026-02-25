"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Button, Textarea } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Tableau blanc</strong> fournit des post-it et zones de texte pour rétrospectives ou ateliers. Contenu sauvegardé en local ou en base.
    </p>
    <CodeBlock code={'# bpm — tableau blanc : post-it et zones de texte\nbpm.title("Rétro")\nbpm.panel("Post-it", zone_texte)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Post-it (démo)</h2>
      <Panel variant="info" title="Zone idées">
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {["Bien : livraison à l'heure", "À améliorer : tests", "Action : doc API"].map((t, i) => (
            <div key={i} className="p-3 rounded border text-sm" style={{ background: "#fef9c3", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>{t}</div>
          ))}
        </div>
        <Textarea label="Nouveau post-it" rows={2} value="" onChange={() => {}} placeholder="Saisir une idée..." />
        <Button size="small" className="mt-2">Ajouter</Button>
      </Panel>
    </>
  );
}

export default function TableauBlancModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Tableau blanc</div>
        <h1>Tableau blanc</h1>
        <p className="doc-description">Post-it et zones de texte pour rétros ou ateliers. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
