"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Input, Selectbox, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Règles événement vers destinataires et message. Notifications ciblées.
    </p>
    <CodeBlock code={'bpm.title("Notifications ciblées")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Règle (démo)">
      <Selectbox options={[{ value: "validation", label: "Validation document" }]} value={null} onChange={() => {}} placeholder="Événement" label="Événement" />
      <Input label="Destinataires" placeholder="admin@" value="" onChange={() => {}} className="mt-4" />
      <Button className="mt-4">Enregistrer</Button>
    </Panel>
  );
}

export default function NotificationsCibleesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Notifications ciblées</div>
        <h1>Notifications ciblées</h1>
        <p className="doc-description">Règles événement → destinataires. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Processus & workflow</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/notifications-ciblees/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
