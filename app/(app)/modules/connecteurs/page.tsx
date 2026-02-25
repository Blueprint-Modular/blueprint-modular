"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Configuration de sources (API, SFTP, base) pour alimenter des données.
    </p>
    <CodeBlock code={'bpm.title("Connecteurs")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Nouveau connecteur">
      <Selectbox options={[{ value: "api", label: "API REST" }, { value: "sftp", label: "SFTP" }]} value={null} onChange={() => {}} placeholder="Type" label="Type" />
      <Input label="URL" placeholder="https://api.example.com" value="" onChange={() => {}} className="mt-4" />
      <Button className="mt-4">Enregistrer</Button>
    </Panel>
  );
}

export default function ConnecteursModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Connecteurs</div>
        <h1>Connecteurs</h1>
        <p className="doc-description">Configuration de sources (API, SFTP, base). Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Intégrations & technique</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/connecteurs/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
