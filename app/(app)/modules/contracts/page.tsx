"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Spinner, Selectbox, Panel, Button, Tabs } from "@/components/bpm";
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

function statusBadgeStyle(s: string): { bg: string; label: string } {
  switch (s) {
    case "pending": return { bg: "var(--bpm-accent-amber, #f59e0b)", label: "En attente" };
    case "analyzing": return { bg: "var(--bpm-accent-cyan)", label: "En cours" };
    case "done": return { bg: "var(--bpm-accent-mint)", label: "Analysé" };
    case "error": return { bg: "var(--bpm-accent)", label: "Erreur" };
    default: return { bg: "var(--bpm-text-secondary)", label: s };
  }
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workspace, setWorkspace] = useState("");
  const [contractType, setContractType] = useState("");
  const [status, setStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, filename: string) => {
    if (deletingId) return;
    if (!confirm(`Supprimer le contrat « ${filename} » ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setContracts((prev) => prev.filter((c) => c.id !== id));
      } else {
        const err = await res.json().catch(() => ({}));
        alert((err && typeof err === "object" && "error" in err && typeof (err as { error?: string }).error === "string") ? (err as { error: string }).error : "Erreur lors de la suppression.");
      }
    } finally {
      setDeletingId(null);
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
        const statusKey = (row.statusKey as string) ?? String(val ?? "");
        const s = String(val ?? "");
        const id = row.id as string | undefined;
        const isError = statusKey === "error";
        const isReanalyzing = id && reanalyzingId === id;
        const { bg, label } = statusBadgeStyle(statusKey);
        const displayLabel = s.startsWith("En cours (") ? s : label;
        return (
          <span className="flex items-center gap-2 flex-wrap">
            <span
              className="rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: bg, color: "var(--bpm-bg)" }}
            >
              {displayLabel}
            </span>
            {isError && id && (
              <span onClick={(e) => e.stopPropagation()}>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={!!reanalyzingId}
                  onClick={() => handleReanalyze(id)}
                >
                  {isReanalyzing ? "…" : "Relancer l'analyse"}
                </Button>
              </span>
            )}
          </span>
        );
      },
    },
  ];

  const filteredContracts = searchText.trim()
    ? contracts.filter((c) =>
        c.originalFilename.toLowerCase().includes(searchText.trim().toLowerCase())
      )
    : contracts;

  const data = filteredContracts.map((c) => ({
    id: c.id,
    originalFilename: c.originalFilename,
    supplier_name: c.supplier_name ?? "-",
    contractType: c.contractType,
    contract_date: c.contract_date ?? "-",
    end_date: c.end_date ?? "-",
    overall_risk_level: c.overall_risk_level ?? "-",
    statusKey: c.status,
    status: c.status === "analyzing" ? `En cours (${c.analysisProgress}%)` : c.status === "done" ? "Analysé" : c.status === "pending" ? "En attente" : c.status === "error" ? "error" : c.status,
  }));

  const listTabContent = (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="search"
          placeholder="Rechercher par nom de fichier…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-3 py-2 rounded border text-sm max-w-xs flex-1 min-w-[200px]"
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
          }}
          aria-label="Rechercher par nom de fichier"
        />
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
          Passez par l&apos;onglet <strong>Importer</strong> pour ajouter des fichiers PDF, DOCX ou TXT et lancer l&apos;analyse IA.
        </Panel>
      ) : filteredContracts.length === 0 ? (
        <Panel variant="info" title="Aucun résultat">
          Aucun contrat ne correspond à &quot;{searchText}&quot;. Modifiez la recherche ou les filtres.
        </Panel>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={data}
            minWidth={560}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/contracts/${id}`);
            }}
          />
        </div>
      )}
    </>
  );

  const importTabContent = (
    <>
      {uploading && (
        <div className="flex items-center justify-center gap-2 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <Spinner size="small" text="Analyse en cours..." />
        </div>
      )}
      <DocumentAnalysisImport
        title="Importer des contrats"
        description="Glissez-déposez ou sélectionnez des fichiers PDF, DOCX ou TXT. Les documents seront analysés par l'IA et ajoutés à la base contractuelle."
        accept=".pdf,.docx,.txt"
        maxFiles={10}
        dropLabel="Glissez-déposez ou cliquez pour sélectionner des fichiers (jusqu'à 10)"
        buttonLabel="Analyser les documents"
        disabled={uploading}
        onAnalyze={handleAnalyze}
      />
    </>
  );

  return (
    <div className="doc-page contracts-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Base contractuelle</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Base contractuelle</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Importez des contrats fournisseurs, CGV ou analyses pour générer une synthèse actionnable. Consultez la liste et cliquez sur une ligne pour ouvrir le détail.
        </p>
      </div>

      <Tabs
        tabs={[
          { label: "Liste des contrats", content: listTabContent },
          { label: "Importer", content: importTabContent },
        ]}
        defaultTab={0}
      />

      <nav className="doc-pagination mt-8">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour aux modules</Link>
        <Link href="/modules/contracts/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
