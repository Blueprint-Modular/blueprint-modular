"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Panel, Spinner, Table } from "@/components/bpm";
import type { TableColumn } from "@/components/bpm";
import { useAssistant } from "@/lib/ai/assistant-context";
import { getTypeLabel, getStatusLabel, getRiskLabel, getWorkspaceLabel } from "@/lib/contracts/labels";

type ExtractedData = {
  supplier_name?: string;
  buyer_name?: string;
  signatories?: Array<{ name: string; role: string; date?: string }>;
  contract_date?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  termination_notice_days?: number;
  waiver_deadline?: string;
  commitments?: Array<{
    type: string;
    description: string;
    amount?: number;
    currency?: string;
    deadline?: string;
    party_responsible: string;
  }>;
  payment_terms?: string;
  penalty_clauses?: string[];
  confidentiality?: boolean;
  exclusivity?: boolean;
  governing_law?: string;
  dispute_resolution?: string;
  executive_summary?: string;
  key_risks?: string[];
  key_opportunities?: string[];
  action_items?: Array<{ action: string; deadline?: string; owner: string }>;
  overall_risk_level?: "low" | "medium" | "high";
};

interface Contract {
  id: string;
  title: string;
  contractType: string;
  workspace: string;
  originalFilename: string;
  status: string;
  analysisProgress: number;
  extractedData: ExtractedData | null;
  createdAt: string;
  analyzedAt: string | null;
}

function buildContractContextForAssistant(data: ExtractedData | null, title: string): string {
  if (!data) return `Contrat : ${title}. Analyse non disponible.`;
  const parts: string[] = [`Contrat : ${title}.`];
  if (data.executive_summary) parts.push(`Résumé : ${data.executive_summary}`);
  if (data.supplier_name) parts.push(`Fournisseur : ${data.supplier_name}`);
  if (data.buyer_name) parts.push(`Acheteur : ${data.buyer_name}`);
  if (data.contract_date) parts.push(`Date contrat : ${data.contract_date}`);
  if (data.end_date) parts.push(`Date fin : ${data.end_date}`);
  if (data.overall_risk_level) parts.push(`Niveau de risque : ${data.overall_risk_level}`);
  if (data.key_risks?.length) parts.push(`Risques : ${data.key_risks.join(" ; ")}`);
  if (data.key_opportunities?.length) parts.push(`Opportunités : ${data.key_opportunities.join(" ; ")}`);
  if (data.payment_terms) parts.push(`Paiement : ${data.payment_terms}`);
  return parts.join("\n");
}

interface ContractListItem {
  id: string;
  originalFilename: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [prevContract, setPrevContract] = useState<ContractListItem | null>(null);
  const [nextContract, setNextContract] = useState<ContractListItem | null>(null);
  const assistant = useAssistant();

  const fetchContract = useCallback(() => {
    if (!id) return;
    fetch(`/api/contracts/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  // Polling auto-refresh si le contrat est en cours d'analyse
  useEffect(() => {
    if (!contract || contract.status !== "analyzing") return;
    const interval = setInterval(fetchContract, 3000);
    return () => clearInterval(interval);
  }, [contract, fetchContract]);

  // Récupérer la liste des contrats pour prev/next
  useEffect(() => {
    if (!id || loading) return;
    fetch("/api/contracts", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((contracts: ContractListItem[]) => {
        const currentIndex = contracts.findIndex((c) => c.id === id);
        if (currentIndex > 0) {
          setPrevContract(contracts[currentIndex - 1]);
        }
        if (currentIndex >= 0 && currentIndex < contracts.length - 1) {
          setNextContract(contracts[currentIndex + 1]);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, [id, loading]);

  const reanalyze = async () => {
    if (!id || reanalyzing) return;
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/contracts/${id}/reanalyze`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const updated = await res.json();
        setContract(updated);
      }
    } finally {
      setReanalyzing(false);
    }
  };

  const askAssistant = () => {
    const ctx = buildContractContextForAssistant(contract?.extractedData ?? null, contract?.originalFilename ?? "Contrat");
    assistant?.openAssistant(ctx);
  };

  if (loading || !contract) {
    return (
      <div className="doc-page flex justify-center items-center min-h-[200px]">
        {loading ? <Spinner size="medium" /> : <Panel variant="warning" title="Contrat introuvable">Ce contrat n’existe pas ou vous n’y avez pas accès.</Panel>}
      </div>
    );
  }

  const ex = contract.extractedData;
  const riskColor = ex?.overall_risk_level === "low" ? "var(--bpm-accent-mint)" : ex?.overall_risk_level === "high" ? "var(--bpm-accent)" : "var(--bpm-accent-cyan)";
  const isAnalyzing = contract.status === "analyzing" || reanalyzing;

  // Colonnes pour le tableau des signataires
  const signatoriesColumns: TableColumn[] = useMemo(
    () => [
      { key: "name", label: "Nom" },
      { key: "role", label: "Rôle" },
      { key: "date", label: "Date" },
    ],
    []
  );

  const signatoriesData = useMemo(
    () =>
      ex?.signatories?.map((s, i) => ({
        name: s.name,
        role: s.role,
        date: s.date ?? "—",
        id: i,
      })) ?? [],
    [ex?.signatories]
  );

  // Colonnes pour le tableau des engagements
  const commitmentsColumns: TableColumn[] = useMemo(
    () => [
      { key: "type", label: "Type" },
      { key: "description", label: "Description" },
      { key: "amount", label: "Montant", align: "right" },
      { key: "deadline", label: "Échéance" },
      { key: "party_responsible", label: "Responsable" },
    ],
    []
  );

  const commitmentsData = useMemo(
    () =>
      ex?.commitments?.map((c, i) => ({
        type: c.type,
        description: c.description,
        amount: c.amount != null ? `${c.amount} ${c.currency ?? ""}`.trim() : "—",
        deadline: c.deadline ?? "—",
        party_responsible: c.party_responsible ?? "—",
        id: i,
      })) ?? [],
    [ex?.commitments]
  );

  // Colonnes pour le tableau des actions recommandées
  const actionItemsColumns: TableColumn[] = useMemo(
    () => [
      { key: "action", label: "Action" },
      { key: "deadline", label: "Échéance" },
      { key: "owner", label: "Responsable" },
    ],
    []
  );

  const actionItemsData = useMemo(
    () =>
      ex?.action_items?.map((a, i) => ({
        action: a.action,
        deadline: a.deadline ?? "—",
        owner: a.owner ?? "—",
        id: i,
      })) ?? [],
    [ex?.action_items]
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="contract-title">{contract.originalFilename}</h1>
          <p className="doc-description">
            {getWorkspaceLabel(contract.workspace)} · {getTypeLabel(contract.contractType)} · Statut : {getStatusLabel(contract.status)}
            {ex?.overall_risk_level && (
              <span className="ml-2 rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: riskColor, color: "var(--bpm-bg)" }}>
                Risque {getRiskLabel(ex.overall_risk_level)}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={reanalyze}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing}
            aria-label={isAnalyzing ? "Analyse en cours, veuillez patienter" : "Relancer l'analyse du contrat"}
          >
            {isAnalyzing ? "Analyse en cours…" : "Relancer l'analyse"}
          </Button>
          <Button onClick={askAssistant} aria-label="Poser une question sur ce contrat à l'assistant IA">
            Poser une question
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <section aria-labelledby="section-parties">
            <Panel variant="info" title={<span id="section-parties">Parties & signataires</span>}>
            <div className="space-y-3">
              {ex?.supplier_name && (
                <div>
                  <strong>Fournisseur :</strong> <span>{ex.supplier_name}</span>
                </div>
              )}
              {ex?.buyer_name && (
                <div>
                  <strong>Acheteur :</strong> <span>{ex.buyer_name}</span>
                </div>
              )}
              {signatoriesData.length > 0 ? (
                <div className="mt-3">
                  <Table
                    columns={signatoriesColumns}
                    data={signatoriesData}
                    keyColumn="id"
                    emptyMessage="Aucun signataire extrait"
                    minWidth={400}
                  />
                </div>
              ) : !ex?.supplier_name && !ex?.buyer_name ? (
                <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Non extrait</p>
              ) : null}
            </div>
            </Panel>
          </section>

          <section aria-labelledby="section-dates">
            <Panel variant="info" title={<span id="section-dates">Dates</span>}>
            <div className="space-y-2 text-sm">
              {ex?.contract_date && (
                <div>
                  <strong>Contrat :</strong> <span>{ex.contract_date}</span>
                </div>
              )}
              {ex?.start_date && (
                <div>
                  <strong>Début :</strong> <span>{ex.start_date}</span>
                </div>
              )}
              {ex?.end_date && (
                <div>
                  <strong>Fin :</strong> <span>{ex.end_date}</span>
                </div>
              )}
              {ex?.renewal_date && (
                <div>
                  <strong>Renouvellement :</strong> <span>{ex.renewal_date}</span>
                </div>
              )}
              {ex?.waiver_deadline && (
                <div>
                  <strong>Délai renonciation :</strong> <span>{ex.waiver_deadline}</span>
                </div>
              )}
              {ex?.termination_notice_days != null && (
                <div>
                  <strong>Préavis résiliation :</strong> <span>{ex.termination_notice_days} jours</span>
                </div>
              )}
              {!ex?.contract_date && !ex?.end_date && !ex?.start_date && (
                <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune date extraite</p>
              )}
            </div>
            </Panel>
          </section>

          <section aria-labelledby="section-commitments">
            <Panel variant="info" title={<span id="section-commitments">Engagements</span>}>
            {commitmentsData.length > 0 ? (
              <Table
                columns={commitmentsColumns}
                data={commitmentsData}
                keyColumn="id"
                emptyMessage="Aucun engagement extrait"
                minWidth={600}
              />
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun engagement extrait</p>
            )}
            </Panel>
          </section>

          <section aria-labelledby="section-clauses">
            <Panel variant="info" title={<span id="section-clauses">Clauses</span>}>
            <div className="space-y-2 text-sm">
              {ex?.payment_terms && (
                <div>
                  <strong>Paiement :</strong> <span>{ex.payment_terms}</span>
                </div>
              )}
              {ex?.confidentiality != null && (
                <div>
                  <strong>Confidentialité :</strong> <span>{ex.confidentiality ? "Oui" : "Non"}</span>
                </div>
              )}
              {ex?.exclusivity != null && (
                <div>
                  <strong>Exclusivité :</strong> <span>{ex.exclusivity ? "Oui" : "Non"}</span>
                </div>
              )}
              {ex?.governing_law && (
                <div>
                  <strong>Droit applicable :</strong> <span>{ex.governing_law}</span>
                </div>
              )}
              {ex?.dispute_resolution && (
                <div>
                  <strong>Résolution litiges :</strong> <span>{ex.dispute_resolution}</span>
                </div>
              )}
              {ex?.penalty_clauses?.length ? (
                <div>
                  <strong>Pénalités :</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {ex.penalty_clauses.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {!ex?.payment_terms && ex?.confidentiality == null && !ex?.governing_law && !ex?.dispute_resolution && (
                <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune clause extraite</p>
              )}
            </div>
            </Panel>
          </section>

          <section aria-labelledby="section-actions">
            <Panel variant="info" title={<span id="section-actions">Actions recommandées</span>}>
            {actionItemsData.length > 0 ? (
              <Table
                columns={actionItemsColumns}
                data={actionItemsData}
                keyColumn="id"
                emptyMessage="Aucune action extraite"
                minWidth={500}
              />
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune action extraite</p>
            )}
            </Panel>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="section-summary">
            <Panel variant="info" title={<span id="section-summary">Synthèse</span>}>
            {ex?.executive_summary ? (
              <p className="text-sm whitespace-pre-wrap">{ex.executive_summary}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune synthèse disponible. Lancez une ré-analyse si le contrat est déjà analysé.</p>
            )}
            </Panel>
          </section>

          <section aria-labelledby="section-risks">
            <Panel variant="info" title={<span id="section-risks">Risques</span>}>
            {ex?.key_risks?.length ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {ex.key_risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun risque identifié</p>
            )}
            </Panel>
          </section>

          <section aria-labelledby="section-opportunities">
            <Panel variant="info" title={<span id="section-opportunities">Opportunités</span>}>
            {ex?.key_opportunities?.length ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {ex.key_opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune opportunité identifiée</p>
            )}
            </Panel>
          </section>
        </div>
      </div>

      {(prevContract || nextContract) && (
        <div className="flex justify-between mt-8 pt-4" style={{ borderTop: "1px solid var(--bpm-border)" }}>
          {prevContract ? (
            <Link
              href={`/modules/contracts/${prevContract.id}`}
              className="text-sm hover:underline"
              style={{ color: "var(--bpm-accent-cyan)" }}
              aria-label={`Contrat précédent : ${prevContract.originalFilename}`}
            >
              ← {prevContract.originalFilename}
            </Link>
          ) : (
            <span></span>
          )}
          {nextContract && (
            <Link
              href={`/modules/contracts/${nextContract.id}`}
              className="text-sm ml-auto hover:underline"
              style={{ color: "var(--bpm-accent-cyan)" }}
              aria-label={`Contrat suivant : ${nextContract.originalFilename}`}
            >
              {nextContract.originalFilename} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
