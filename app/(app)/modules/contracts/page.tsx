"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Spinner, Selectbox, Panel, Button } from "@/components/bpm";
import { DocumentAnalysisImport } from "@/components/DocumentAnalysisImport";

type Extracted = { supplier_name?: string; contract_date?: string; end_date?: string; overall_risk_level?: string };

interface ContractRow {
  id: string;
  title: string;
  contractType: string;
  workspace: string;
  originalFilename: string;
  status: string;
  analysisProgress: number;
  extractedData?: Extracted | null;
  supplier_name?: string | null;
  contract_date?: string | null;
  end_date?: string | null;
  overall_risk_level?: string | null;
  createdAt: string;
}

function flattenContract(c: ContractRow): ContractRow {
  const ex = c.extractedData as Extracted | null | undefined;
  return {
    ...c,
    supplier_name: c.supplier_name ?? ex?.supplier_name ?? null,
    contract_date: c.contract_date ?? ex?.contract_date ?? null,
    end_date: c.end_date ?? ex?.end_date ?? null,
    overall_risk_level: c.overall_risk_level ?? ex?.overall_risk_level ?? null,
  };
}

const WORKSPACES = [
  { value: "", label: "Tous les workspaces" },
  { value: "service1", label: "Service 1" },
  { value: "service2", label: "Service 2" },
];
const TYPES = [
  { value: "", label: "Tous les types" },
  { value: "supplier", label: "Fournisseur" },
  { value: "cgv", label: "CGV" },
  { value: "other", label: "Autre" },
];
const STATUSES = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "analyzing", label: "En cours" },
  { value: "done", label: "Analysé" },
  { value: "error", label: "Erreur" },
];

function riskColor(level: string | null): string {
  if (!level) return "var(--bpm-text-secondary)";
  if (level === "low") return "var(--bpm-accent-mint)";
  if (level === "high") return "var(--bpm-accent)";
  return "var(--bpm-accent-cyan)";
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workspace, setWorkspace] = useState("");
  const [contractType, setContractType] = useState("");
  const [status, setStatus] = useState("");
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);

  const fetchContracts = useCallback(() => {
    const params = new URLSearchParams();
    if (workspace) params.set("workspace", workspace);
    if (contractType) params.set("contractType", contractType);
    if (status) params.set("status", status);
    fetch(`/api/contracts?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setContracts(list.map((c: ContractRow) => flattenContract(c)));
        setLoading(false);
      })
      .catch(() => {
        setContracts([]);
        setLoading(false);
      });
  }, [workspace, contractType, status]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    const hasAnalyzing = contracts.some((c) => c.status === "analyzing" || c.status === "pending");
    if (!hasAnalyzing) return;
    const interval = setInterval(fetchContracts, 3000);
    return () => clearInterval(interval);
  }, [contracts, fetchContracts]);

  const handleReanalyze = async (id: string) => {
    if (reanalyzingId) return;
    setReanalyzingId(id);
    try {
      const res = await fetch(`/api/contracts/${id}/reanalyze`, { method: "POST", credentials: "include" });
      if (res.ok) fetchContracts();
    } finally {
      setReanalyzingId(null);
    }
  };

  const handleAnalyze = async (files: File[]) => {
    if (files.length === 0) return;
    const ws = workspace || "service1";
    const ct = contractType || "other";
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspace", ws);
        formData.append("contractType", ct);
        const res = await fetch("/api/contracts", { method: "POST", body: formData, credentials: "include" });
        if (res.ok) {
          const created = await res.json();
          setContracts((prev) => [flattenContract(created as ContractRow), ...prev]);
        } else {
          if (res.status === 413) {
            alert("Fichier trop volumineux pour l'upload (limite du serveur). Réduisez la taille du fichier ou compressez le PDF.");
            continue;
          }
          const err = await res.json().catch(() => ({}));
          const msg = (err && typeof err === "object" && "error" in err && typeof (err as { error?: string }).error === "string")
            ? (err as { error: string }).error
            : res.status === 401
              ? "Non autorisé. Connectez-vous pour importer des contrats."
              : `Erreur upload (${res.status})`;
          alert(msg);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { key: "originalFilename", label: "Nom" },
    { key: "supplier_name", label: "Fournisseur" },
    { key: "contractType", label: "Type" },
    { key: "contract_date", label: "Date contrat" },
    { key: "end_date", label: "Date fin" },
    {
      key: "overall_risk_level",
      label: "Risque",
      render: (val: unknown) => {
        const v = String(val ?? "");
        if (v === "-" || !v) return v;
        const label = v === "low" ? "Faible" : v === "high" ? "Élevé" : "Moyen";
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: riskColor(v), color: "var(--bpm-bg)" }}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Statut",
      render: (val: unknown, row: Record<string, unknown>) => {
        const s = String(val ?? "");
        const id = row.id as string | undefined;
        const isError = s === "error";
        const isReanalyzing = id && reanalyzingId === id;
        const statusLabel = isError ? "Erreur" : s;
        return (
          <span className="flex items-center gap-2 flex-wrap">
            <span className={isError ? "rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800" : ""}>{statusLabel}</span>
            {isError && id && (
              <Button
                size="small"
                variant="secondary"
                disabled={!!reanalyzingId}
                onClick={(e) => { e.stopPropagation(); handleReanalyze(id); }}
              >
                {isReanalyzing ? "…" : "Relancer l'analyse"}
              </Button>
            )}
          </span>
        );
      },
    },
  ];

  const data = contracts.map((c) => ({
    id: c.id,
    originalFilename: c.originalFilename,
    supplier_name: c.supplier_name ?? "-",
    contractType: c.contractType,
    contract_date: c.contract_date ?? "-",
    end_date: c.end_date ?? "-",
    overall_risk_level: c.overall_risk_level ?? "-",
    status: c.status === "analyzing" ? `En cours (${c.analysisProgress}%)` : c.status === "done" ? "Analysé" : c.status === "pending" ? "En attente" : c.status === "error" ? "error" : c.status,
  }));

  return (
    <div className="doc-page contracts-page">
      <div id="documentation">
      <DocumentAnalysisImport
        title="Base contractuelle"
        description="Importez des documents PDF (contrats fournisseurs, CGV, analyses) pour générer automatiquement une synthèse actionnable grâce à Claude. Les analyses sont stockées en base de données et peuvent être réexploitées dans d'autres onglets."
        accept=".pdf,.docx,.txt"
        maxFiles={10}
        dropLabel="Glissez-déposez ou cliquez pour sélectionner des fichiers PDF, DOCX ou TXT (jusqu'à 10 fichiers)"
        buttonLabel="Analyser les documents"
        disabled={uploading}
        onAnalyze={handleAnalyze}
      />
      </div>
      {uploading && (
        <div className="flex items-center justify-center gap-2 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <Spinner size="small" text="Analyse en cours..." />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-6 mb-4">
        <Selectbox
          options={WORKSPACES}
          value={workspace}
          onChange={(v) => setWorkspace(v ?? "")}
          placeholder="Workspace"
        />
        <Selectbox
          options={TYPES}
          value={contractType}
          onChange={(v) => setContractType(v ?? "")}
          placeholder="Type"
        />
        <Selectbox
          options={STATUSES}
          value={status}
          onChange={(v) => setStatus(v ?? "")}
          placeholder="Statut"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : contracts.length === 0 ? (
        <Panel variant="info" title="Aucun contrat">
          Uploadez un fichier PDF, DOCX ou TXT pour lancer l&apos;analyse IA.
        </Panel>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={data}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/contracts/${id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
