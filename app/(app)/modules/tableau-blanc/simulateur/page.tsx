"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Textarea, Button } from "@/components/bpm";

const initialPostIts = [
  "Bien : livraison à l'heure",
  "À améliorer : tests",
  "Action : doc API",
];

export default function TableauBlancSimulateurPage() {
  const [postIts, setPostIts] = useState<string[]>(initialPostIts);
  const [newText, setNewText] = useState("");

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    setPostIts((prev) => [...prev, trimmed]);
    setNewText("");
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">Tableau blanc</Link> → Simulateur
        </div>
        <h1>Simulateur — Tableau blanc</h1>
        <p className="doc-description">Post-it de démo : ajoutez un post-it avec la zone de saisie ci-dessous.</p>
      </div>
      <Panel variant="info" title="Zone idées">
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {postIts.map((t, i) => (
            <div key={i} className="p-3 rounded border text-sm" style={{ background: "#fef9c3", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>{t}</div>
          ))}
        </div>
        <Textarea label="Nouveau post-it" rows={2} value={newText} onChange={(v) => setNewText(v)} placeholder="Saisir une idée..." />
        <Button size="small" className="mt-2" onClick={handleAdd}>Ajouter</Button>
      </Panel>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Tableau blanc</Link>
      </p>
    </div>
  );
}
