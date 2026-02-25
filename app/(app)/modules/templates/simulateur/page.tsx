"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Selectbox, Input, Button, useToast } from "@/components/bpm";

const TEMPLATE_OPTIONS = [
  { value: "rapport", label: "Rapport mensuel" },
  { value: "fiche", label: "Fiche projet" },
  { value: "email", label: "Email type" },
];

/** Champs démo par type de modèle (P8 amorce) */
const TEMPLATE_FIELDS: Record<string, { key: string; label: string; type: string; placeholder: string }[]> = {
  rapport: [
    { key: "periode", label: "Période", type: "text", placeholder: "Ex. Mars 2025" },
    { key: "responsable", label: "Responsable", type: "text", placeholder: "Nom du responsable" },
    { key: "ca_realise", label: "CA réalisé (€)", type: "number", placeholder: "0" },
  ],
  fiche: [
    { key: "projet", label: "Nom du projet", type: "text", placeholder: "Ex. Refonte site" },
    { key: "chef", label: "Chef de projet", type: "text", placeholder: "Nom" },
    { key: "date_limite", label: "Date limite", type: "text", placeholder: "JJ/MM/AAAA" },
  ],
  email: [
    { key: "destinataire", label: "Destinataire", type: "text", placeholder: "email@exemple.com" },
    { key: "objet", label: "Objet", type: "text", placeholder: "Objet du message" },
    { key: "corps", label: "Message", type: "text", placeholder: "Contenu..." },
  ],
};

export default function TemplatesSimulateurPage() {
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

  const updateField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">Templates</Link> → Simulateur
        </div>
        <h1>Simulateur — Templates</h1>
        <p className="doc-description">Choisir un modèle et remplir les champs (démo).</p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        <p className="text-xs font-medium mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Étape 1 — Choisir un modèle
        </p>
        <Selectbox
          options={TEMPLATE_OPTIONS}
          value={selectedModel}
          onChange={(v) => {
            setSelectedModel(v);
            setFieldValues({});
            setFormError(null);
          }}
          placeholder="Choisir un modèle..."
          label="Modèle"
        />

        {selectedModel && (
          <>
            <p className="text-xs font-medium mt-6 mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
              Étape 2 — Remplir les champs
            </p>
            <Input
              label="Nom du document"
              placeholder="Ex. Rapport mars 2025"
              value={documentName}
              onChange={setDocumentName}
              className="mb-4"
            />
            {fields.length > 0 && (
              <div className="space-y-3 mt-4">
                {fields.map((f) => (
                  <Input
                    key={f.key}
                    label={f.label}
                    placeholder={f.placeholder}
                    value={fieldValues[f.key] ?? ""}
                    onChange={(v) => updateField(f.key, v)}
                  />
                ))}
              </div>
            )}

            {formError && (
              <p className="text-sm mt-3" style={{ color: "#e74c3c" }}>
                {formError}
              </p>
            )}
            <div className="mt-4">
              <Button onClick={handleCreate} disabled={!canCreate}>
                Créer à partir du modèle
              </Button>
            </div>
          </>
        )}

        {!selectedModel && (
          <p className="text-sm mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Sélectionnez un modèle pour afficher les champs à remplir et créer un document.
          </p>
        )}
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module Templates
        </Link>
      </p>
    </div>
  );
}
