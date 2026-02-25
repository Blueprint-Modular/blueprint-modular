"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Message, Spinner } from "@/components/bpm";
import { DocumentAnalysisImport } from "@/components/DocumentAnalysisImport";

interface Document {
  id: string;
  filename: string;
  analysisStatus: "pending" | "processing" | "done" | "error";
  supplier: string | null;
  client: string | null;
  contractDate: string | null;
  terminationDate: string | null;
  summary: string | null;
  createdAt: string;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDocuments = () => {
    fetch("/api/documents", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDocuments([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.analysisStatus === "processing" || d.analysisStatus === "pending"
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents]);

  const handleAnalyze = async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) {
      alert("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setUploading(true);
    try {
      for (const file of pdfs) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/documents", { method: "POST", body: formData, credentials: "include" });
        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [newDoc, ...prev]);
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = (err && typeof err === "object" && "error" in err && typeof err.error === "string")
            ? err.error
            : res.status === 413
              ? "Fichier trop volumineux (limite 1 Mo par défaut). Vérifiez la config serveur."
              : `Erreur upload (${res.status})`;
          alert(msg);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alerts = documents.filter((d) => {
    if (!d.terminationDate) return false;
    const t = new Date(d.terminationDate);
    return t >= today && t <= in30Days;
  });

  const filtered = documents.filter(
    (d) =>
      !search ||
      [d.supplier, d.client, d.filename].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const columns = [
    { key: "filename", label: "Fichier" },
    { key: "supplier", label: "Fournisseur" },
    { key: "client", label: "Client" },
    { key: "contractDate", label: "Date contrat" },
    { key: "terminationDate", label: "Dénonciation" },
    { key: "analysisStatus", label: "Statut" },
  ];

  const tableData = filtered.map((d) => ({
    id: d.id,
    filename: d.filename,
    supplier: d.supplier ?? "—",
    client: d.client ?? "—",
    contractDate: d.contractDate
      ? new Date(d.contractDate).toLocaleDateString("fr-FR")
      : "—",
    terminationDate: d.terminationDate
      ? `${new Date(d.terminationDate).toLocaleDateString("fr-FR")} (J-${daysUntil(d.terminationDate)})`
      : "—",
    analysisStatus:
      d.analysisStatus === "done"
        ? "✓"
        : d.analysisStatus === "error"
          ? "✗ Erreur"
          : d.analysisStatus === "processing"
            ? "⏳ Analyse..."
            : "⏳ En attente",
  }));

  return (
    <div className="documents-page doc-page">
      <div id="documentation">
      <DocumentAnalysisImport
        title="Analyse de documents"
        description="Importez des documents PDF (analyses, études, rapports) pour générer automatiquement une synthèse actionnable grâce à Claude. Les analyses sont stockées en base de données et peuvent être réexploitées dans d'autres onglets."
        accept=".pdf"
        maxFiles={10}
        dropLabel="Glissez-déposez ou cliquez pour sélectionner des fichiers PDF (jusqu'à 10 fichiers)"
        buttonLabel="Analyser les documents"
        disabled={uploading}
        onAnalyze={handleAnalyze}
      />
      {uploading && (
        <div className="flex items-center justify-center gap-2 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <Spinner size="small" text="Analyse en cours..." />
        </div>
      )}
      </div>

      <div className="documents-header mt-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Documents</h2>
      </div>

      {alerts.length > 0 && (
        <Message type="warning">
          ⚠ {alerts.length} contrat{alerts.length > 1 ? "s" : ""} à dénoncer dans les 30 prochains jours :{" "}
          {alerts.map((a) => `${a.supplier || a.filename} (J-${daysUntil(a.terminationDate!)})`).join(", ")}
        </Message>
      )}

      <div className="documents-filters">
        <input
          type="search"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner text="Chargement des documents..." />
      ) : documents.length === 0 ? (
        <div className="documents-empty py-6">
          <p style={{ color: "var(--bpm-text-secondary)" }}>Aucun document analysé pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="documents-table-scroll" style={{ marginBottom: 24 }}>
          <Table
            columns={columns}
            data={tableData}
            striped
            hover
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) window.location.href = `/modules/documents/${id}`;
            }}
          />
        </div>
      )}
    </div>
  );
}
