"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Table } from "@/components/bpm";

const logData = [{ qui: "Alice", quand: "2025-02-25 10:00", quoi: "Modification statut → Validé" }];

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Consultation des changements sur une entité (qui, quand, quoi). Historique d&apos;audit.
    </p>
    <CodeBlock code={'bpm.title("Audit")\nbpm.table(columns=audit_cols, data=log)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Historique (démo)">
      <Table columns={[{ key: "qui", label: "Qui" }, { key: "quand", label: "Quand" }, { key: "quoi", label: "Quoi" }]} data={logData} striped hover />
    </Panel>
  );
}

export default function AuditLogModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Audit / Log</div>
        <h1>Audit / Log</h1>
        <p className="doc-description">Consultation des changements (qui, quand, quoi). Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Processus & workflow</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/audit-log/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
