"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Badge, Button } from "@/components/bpm";

type Status = "brouillon" | "validé" | "archivé";
type HistoryEntry = { from: Status; to: Status; by: string; date: string };

const formatDate = () => {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")} ${now.getHours()}h${String(now.getMinutes()).padStart(2, "0")}`;
};

export default function WorkflowSimulateurPage() {
  const [status, setStatus] = useState<Status>("validé");
  const [history, setHistory] = useState<HistoryEntry[]>([
    { from: "brouillon", to: "validé", by: "Alice", date: "24/02 14h" },
  ]);

  const transition = (to: Status) => {
    setHistory((prev) => [...prev, { from: status, to, by: "Vous", date: formatDate() }]);
    setStatus(to);
  };

  const canValidate = status === "brouillon";
  const canArchive = status === "validé";

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/workflow">Workflow</Link> → Simulateur
        </div>
        <h1>Simulateur — Workflow</h1>
        <p className="doc-description">
          Testez les transitions Brouillon → Validé → Archivé et l&apos;historique.
        </p>
      </div>

      <Panel variant="info" title="Document #42">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Statut :</span>
          <Badge variant={status === "archivé" ? "default" : status === "validé" ? "primary" : "default"}>
            {status === "brouillon" ? "Brouillon" : status === "validé" ? "Validé" : "Archivé"}
          </Badge>
          {canValidate && (
            <Button size="small" variant="primary" onClick={() => transition("validé")}>
              Valider
            </Button>
          )}
          {canArchive && (
            <Button size="small" variant="outline" onClick={() => transition("archivé")}>
              Archiver
            </Button>
          )}
          {status === "archivé" && (
            <Button size="small" variant="secondary" onClick={() => setStatus("brouillon")}>
              Réinitialiser (démo)
            </Button>
          )}
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Historique :</p>
        <ul className="text-sm list-disc pl-5 space-y-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
          {history.map((h, i) => (
            <li key={i}>{h.from} → {h.to} (par {h.by}, {h.date})</li>
          ))}
        </ul>
      </Panel>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Workflow</Link>
      </p>
    </div>
  );
}
