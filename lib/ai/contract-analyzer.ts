/**
 * Pipeline d'analyse IA d'un contrat — appelle Ollama (VLLMClient).
 * Extraction de métadonnées structurées (JSON) depuis le texte du contrat.
 * Règle : analyse à l'upload uniquement ; résultat stocké en base (extracted_data).
 */

import { vllmClient } from "./vllm-client";
import { TEMPLATE_ANALYSE_CONTRAT } from "./prompt-templates";

export type ContractType = "supplier" | "cgv" | "other";

export interface ExtractedData {
  supplier_name?: string;
  buyer_name?: string;
  signatories?: Array<{ name: string; role: string; date?: string }>;
  contract_date?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  termination_date?: string;
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
}

const MAX_TEXT_CHARS = 12000;

/** Pattern de parsing robuste — extrait le JSON même si le LLM ajoute du texte */
function extractJSON(response: string): string {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Pas de JSON trouvé dans la réponse");
  return response.slice(start, end + 1);
}

function parseAndValidate(raw: string): ExtractedData {
  const jsonStr = extractJSON(raw);
  const data = JSON.parse(jsonStr) as Record<string, unknown>;

  const out: ExtractedData = {};

  if (typeof data.supplier_name === "string") out.supplier_name = data.supplier_name;
  if (typeof data.buyer_name === "string") out.buyer_name = data.buyer_name;
  if (Array.isArray(data.signatories)) out.signatories = data.signatories as ExtractedData["signatories"];
  if (typeof data.contract_date === "string") out.contract_date = data.contract_date;
  if (typeof data.start_date === "string") out.start_date = data.start_date;
  if (typeof data.end_date === "string") out.end_date = data.end_date;
  if (typeof data.renewal_date === "string") out.renewal_date = data.renewal_date;
  if (typeof data.termination_date === "string") out.termination_date = data.termination_date;
  if (typeof data.termination_notice_days === "number") out.termination_notice_days = data.termination_notice_days;
  if (typeof data.waiver_deadline === "string") out.waiver_deadline = data.waiver_deadline;
  if (Array.isArray(data.commitments)) out.commitments = data.commitments as ExtractedData["commitments"];
  if (typeof data.payment_terms === "string") out.payment_terms = data.payment_terms;
  if (Array.isArray(data.penalty_clauses)) out.penalty_clauses = data.penalty_clauses as string[];
  if (typeof data.confidentiality === "boolean") out.confidentiality = data.confidentiality;
  if (typeof data.exclusivity === "boolean") out.exclusivity = data.exclusivity;
  if (typeof data.governing_law === "string") out.governing_law = data.governing_law;
  if (typeof data.dispute_resolution === "string") out.dispute_resolution = data.dispute_resolution;
  if (typeof data.executive_summary === "string") out.executive_summary = data.executive_summary;
  if (Array.isArray(data.key_risks)) out.key_risks = data.key_risks as string[];
  if (Array.isArray(data.key_opportunities)) out.key_opportunities = data.key_opportunities as string[];
  if (Array.isArray(data.action_items)) out.action_items = data.action_items as ExtractedData["action_items"];
  if (data.overall_risk_level === "low" || data.overall_risk_level === "medium" || data.overall_risk_level === "high") {
    out.overall_risk_level = data.overall_risk_level;
  }

  // Champs critiques : on assure au minimum des valeurs par défaut pour ne pas planter l'UI
  if (!out.executive_summary) out.executive_summary = "Résumé non extrait.";
  if (!out.overall_risk_level) out.overall_risk_level = "medium";

  return out;
}

/** Objet minimal retourné en cas d'erreur de parsing — ne jamais faire planter l'app */
const FALLBACK_EXTRACTED: ExtractedData = {
  executive_summary: "Résumé non extrait (réponse du modèle invalide ou incomplète).",
  overall_risk_level: "medium",
};

export async function analyzeContract(
  contractText: string,
  contractType: ContractType
): Promise<ExtractedData> {
  const truncated = contractText.slice(0, MAX_TEXT_CHARS);
  const prompt = TEMPLATE_ANALYSE_CONTRAT({ contractText: truncated, contractType });

  try {
    const { content } = await vllmClient.chat([{ role: "user", content: prompt }], { max_tokens: 4096 });
    console.log("[contract-analyzer] Réponse brute complète:", content);
    console.log("[contract-analyzer] Longueur réponse:", content.length);
    return parseAndValidate(content);
  } catch (err) {
    console.warn("[contract-analyzer] parse or chat failed:", err instanceof Error ? err.message : String(err));
    return FALLBACK_EXTRACTED;
  }
}
