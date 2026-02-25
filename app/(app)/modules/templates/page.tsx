"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tabs, CodeBlock, Selectbox, Input, Button, useToast } from "@/components/bpm";

const TEMPLATE_OPTIONS = [
  { value: "rapport", label: "Rapport mensuel" },
  { value: "fiche", label: "Fiche projet" },
  { value: "email", label: "Email type" },
];

const TEMPLATE_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  rapport: [
    { key: "periode", label: "Période", placeholder: "Ex. Mars 2025" },
    { key: "responsable", label: "Responsable", placeholder: "Nom" },
    { key: "ca_realise", label: "CA réalisé (€)", placeholder: "0" },
  ],
  fiche: [
    { key: "projet", label: "Nom du projet", placeholder: "Ex. Refonte site" },
    { key: "chef", label: "Chef de projet", placeholder: "Nom" },
    { key: "date_limite", label: "Date limite", placeholder: "JJ/MM/AAAA" },
  ],
  email: [
    { key: "destinataire", label: "Destinataire", placeholder: "email@exemple.com" },
    { key: "objet", label: "Objet", placeholder: "Objet" },
    { key: "corps", label: "Message", placeholder: "Contenu..." },
  ],
};

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
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const canCreate = Boolean(selectedModel && documentName.trim());
  const fields = selectedModel ? TEMPLATE_FIELDS[selectedModel] ?? [] : [];

  const handleCreate = () => {
    if (!selectedModel || !documentName.trim()) {
      setFormError("Veuillez sélectionner un modèle et saisir un nom de document.");
      return;
    }
    setFormError(null);
    const modelLabel = TEMPLATE_OPTIONS.find((o) => o.value === selectedModel)?.label ?? selectedModel;
    showToast(`Document « ${documentName.trim()} » créé à partir du modèle « ${modelLabel} ».`, "success", 5000, "Création réussie", "Templates", null);
  };

  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Choisir un modèle (démo)</h2>
      <div className="rounded-lg border p-6 mt-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
        <Selectbox
          options={TEMPLATE_OPTIONS}
          value={selectedModel}
          onChange={(v) => { setSelectedModel(v); setFieldValues({}); setFormError(null); }}
          placeholder="Choisir un modèle..."
          label="Modèle"
        />
        {selectedModel && (
          <>
            <Input label="Nom du document" placeholder="Ex. Rapport mars 2025" value={documentName} onChange={setDocumentName} className="mt-4" />
            {(TEMPLATE_FIELDS[selectedModel] ?? []).map((f) => (
              <Input key={f.key} label={f.label} placeholder={f.placeholder} value={fieldValues[f.key] ?? ""} onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))} className="mt-4" />
            ))}
            {formError && <p className="text-sm mt-3" style={{ color: "#e74c3c" }}>{formError}</p>}
            <Button className="mt-4" onClick={handleCreate} disabled={!canCreate}>Créer à partir du modèle</Button>
          </>
        )}
        {!selectedModel && <p className="text-sm mt-4" style={{ color: "var(--bpm-text-secondary)" }}>Sélectionnez un modèle pour afficher les champs.</p>}
      </div>
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
