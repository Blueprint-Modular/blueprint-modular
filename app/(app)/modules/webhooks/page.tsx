"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Émission d&apos;événements vers des URLs externes (validation, création).
    </p>
    <CodeBlock code={'bpm.title("Webhooks")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Webhook">
      <Input label="URL" placeholder="https://votre-app.com/webhook" value="" onChange={() => {}} />
      <Button className="mt-4">Enregistrer</Button>
    </Panel>
  );
}

export default function WebhooksModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Webhooks</div>
        <h1>Webhooks</h1>
        <p className="doc-description">Émission d&apos;événements vers des URLs externes. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Intégrations & technique</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/webhooks/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
