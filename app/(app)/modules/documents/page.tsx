"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Table, Message, Spinner } from "@/components/bpm";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = () => {
    fetch("/api/documents")
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

  const handleUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Erreur upload");
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
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Module Documents</div>
        <h1>Module Documents</h1>
        <p className="doc-description">
          Analyse de contrats PDF : extraction des métadonnées, résumé, points clés et échéances. Upload et suivi des documents.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
        </div>
      </div>
      <div className="documents-header">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Documents</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "⏳ Analyse en cours..." : "+ Analyser un PDF"}
          </button>
        </div>
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
        <div className="documents-empty">
          <p>Aucun document analysé pour l&apos;instant.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Analyser mon premier contrat
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
