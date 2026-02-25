"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Sélection de langue et textes traduisibles pour l&apos;UI et les contenus.
    </p>
    <CodeBlock code={'bpm.title("Multi-langue")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Langue (démo)">
      <Selectbox options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }]} value={null} onChange={() => {}} placeholder="Langue" label="Langue" />
      <Button className="mt-4">Appliquer</Button>
    </Panel>
  );
}

export default function MultiLangueModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Multi-langue</div>
        <h1>Multi-langue</h1>
        <p className="doc-description">Sélection de langue et textes traduisibles. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Intégrations & technique</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/multi-langue/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
