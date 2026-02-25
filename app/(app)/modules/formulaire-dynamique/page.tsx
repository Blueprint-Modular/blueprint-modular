"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Formulaires dont les champs dépendent d&apos;un type ou d&apos;un référentiel.
    </p>
    <CodeBlock code={'bpm.title("Formulaire dynamique")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Type de demande (démo)">
      <Selectbox options={[{ value: "type_a", label: "Type A" }, { value: "type_b", label: "Type B" }]} value={null} onChange={() => {}} placeholder="Type" label="Type" />
      <Input label="Champ dynamique" placeholder="Selon le type" value="" onChange={() => {}} className="mt-4" />
      <Button className="mt-4">Envoyer</Button>
    </Panel>
  );
}

export default function FormulaireDynamiqueModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Formulaire dynamique</div>
        <h1>Formulaire dynamique</h1>
        <p className="doc-description">Formulaires dont les champs dépendent d&apos;un type ou référentiel. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Métier</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/formulaire-dynamique/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
