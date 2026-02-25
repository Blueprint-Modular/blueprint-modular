"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Templates</strong> propose une bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir. Création de documents à partir d&apos;un modèle.
    </p>
    <CodeBlock code={'bpm.title("Modèles")\nbpm.selectbox(options=modeles, label="Choisir un modèle")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Choisir un modèle (démo)</h2>
      <Panel variant="info" title="Modèles disponibles">
        <Selectbox
          options={[{ value: "rapport", label: "Rapport mensuel" }, { value: "fiche", label: "Fiche projet" }, { value: "email", label: "Email type" }]}
          value={null}
          onChange={() => {}}
          placeholder="Choisir un modèle..."
          label="Modèle"
        />
        <Input label="Nom du document" placeholder="Ex. Rapport mars 2025" value="" onChange={() => {}} className="mt-4" />
        <Button className="mt-4">Créer à partir du modèle</Button>
      </Panel>
    </>
  );
}

export default function TemplatesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Templates</div>
        <h1>Templates</h1>
        <p className="doc-description">Bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/templates/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
