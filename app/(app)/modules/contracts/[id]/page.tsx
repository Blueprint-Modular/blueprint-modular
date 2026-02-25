"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Panel, Spinner } from "@/components/bpm";
import { useAssistant } from "@/lib/ai/assistant-context";

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

export default function ContractDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const assistant = useAssistant();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/contracts/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setContract)
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="doc-page">
      <div className="doc-page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>{contract.originalFilename}</h1>
          <p className="doc-description">
            {contract.workspace} · {contract.contractType} · Statut : {contract.status}
            {ex?.overall_risk_level && (
              <span className="ml-2 rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: riskColor, color: "var(--bpm-bg)" }}>
                Risque {ex.overall_risk_level}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reanalyze} disabled={reanalyzing || contract.status === "analyzing"}>
            {reanalyzing || contract.status === "analyzing" ? "Ré-analyse…" : "Ré-analyser"}
          </Button>
          <Button onClick={askAssistant}>Poser une question</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <Panel variant="info" title="Parties & signataires">
            {ex?.supplier_name && <p><strong>Fournisseur :</strong> {ex.supplier_name}</p>}
            {ex?.buyer_name && <p><strong>Acheteur :</strong> {ex.buyer_name}</p>}
            {ex?.signatories?.length ? (
              <ul className="list-disc pl-5 mt-2">
                {ex.signatories.map((s, i) => (
                  <li key={i}>{s.name} – {s.role}{s.date ? ` (${s.date})` : ""}</li>
                ))}
              </ul>
            ) : !ex?.supplier_name && !ex?.buyer_name && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Non extrait</p>
            )}
          </Panel>

          <Panel variant="info" title="Dates">
            <ul className="space-y-1 text-sm">
              {ex?.contract_date && <li><strong>Contrat :</strong> {ex.contract_date}</li>}
              {ex?.start_date && <li><strong>Début :</strong> {ex.start_date}</li>}
              {ex?.end_date && <li><strong>Fin :</strong> {ex.end_date}</li>}
              {ex?.renewal_date && <li><strong>Renouvellement :</strong> {ex.renewal_date}</li>}
              {ex?.waiver_deadline && <li><strong>Délai renonciation :</strong> {ex.waiver_deadline}</li>}
              {ex?.termination_notice_days != null && <li><strong>Préavis résiliation (jours) :</strong> {ex.termination_notice_days}</li>}
            </ul>
            {!ex?.contract_date && !ex?.end_date && <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune date extraite</p>}
          </Panel>

          <Panel variant="info" title="Engagements">
            {ex?.commitments?.length ? (
              <ul className="space-y-2 text-sm">
                {ex.commitments.map((c, i) => (
                  <li key={i}>
                    <strong>{c.type}</strong> – {c.description}
                    {c.party_responsible && ` (${c.party_responsible})`}
                    {c.amount != null && ` · ${c.amount} ${c.currency ?? ""}`}
                    {c.deadline && ` · ${c.deadline}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun engagement extrait</p>
            )}
          </Panel>

          <Panel variant="info" title="Clauses">
            <ul className="space-y-1 text-sm">
              {ex?.payment_terms && <li><strong>Paiement :</strong> {ex.payment_terms}</li>}
              {ex?.confidentiality != null && <li><strong>Confidentialité :</strong> {ex.confidentiality ? "Oui" : "Non"}</li>}
              {ex?.exclusivity != null && <li><strong>Exclusivité :</strong> {ex.exclusivity ? "Oui" : "Non"}</li>}
              {ex?.governing_law && <li><strong>Droit applicable :</strong> {ex.governing_law}</li>}
              {ex?.dispute_resolution && <li><strong>Résolution litiges :</strong> {ex.dispute_resolution}</li>}
              {ex?.penalty_clauses?.length ? (
                <li><strong>Pénalités :</strong><ul className="list-disc pl-5 mt-1">{ex.penalty_clauses.map((p, i) => <li key={i}>{p}</li>)}</ul></li>
              ) : null}
            </ul>
            {!ex?.payment_terms && ex?.confidentiality == null && !ex?.governing_law && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune clause extraite</p>
            )}
          </Panel>

          <Panel variant="info" title="Actions recommandées">
            {ex?.action_items?.length ? (
              <ul className="space-y-2 text-sm">
                {ex.action_items.map((a, i) => (
                  <li key={i}>{a.action}{a.deadline ? ` (${a.deadline})` : ""} – {a.owner}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune action extraite</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel variant="info" title="Synthèse">
            {ex?.executive_summary ? (
              <p className="text-sm whitespace-pre-wrap">{ex.executive_summary}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune synthèse disponible. Lancez une ré-analyse si le contrat est déjà analysé.</p>
            )}
          </Panel>

          <Panel variant="info" title="Risques">
            {ex?.key_risks?.length ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {ex.key_risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun risque identifié</p>
            )}
          </Panel>

          <Panel variant="info" title="Opportunités">
            {ex?.key_opportunities?.length ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {ex.key_opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune opportunité identifiée</p>
            )}
          </Panel>
        </div>
      </div>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/contracts" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à la Base contractuelle</Link>
        <Link href="/modules/contracts#documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Importer un contrat</Link>
      </nav>
    </div>
  );
}
