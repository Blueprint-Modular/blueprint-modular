/**
 * Templates de prompts — français, adaptés au contexte métier Blueprint Modular.
 * Modèle cible : Qwen3:8b via Ollama local.
 * Règle absolue : le LLM commente, jamais il ne calcule.
 */

export const SYSTEM_PROMPT_BASE = `Tu es un assistant IA intégré à Blueprint Modular,
un framework de gestion d'entreprise.

Tu réponds TOUJOURS en français, de manière précise et structurée.
Tu ne fais jamais d'hypothèses sur des données que tu n'as pas reçues.
Tu ne calcules jamais toi-même — les chiffres que tu reçois sont déjà calculés et fiables.
Si une information est absente du contexte, tu le signales explicitement.`;

export function SYSTEM_PROMPT_WITH_CONTEXT(context: string): string {
  return `${SYSTEM_PROMPT_BASE}

Voici les données des modules actuellement sélectionnés :

---
${context}
---

Utilise uniquement ces données pour répondre. 
Si la question porte sur des informations absentes du contexte, indique-le clairement.`;
}

// ─── Templates par type d'analyse ───────────────────────────────────────────

/** Analyse de données chiffrées — tableaux, métriques, KPI */
export const TEMPLATE_ANALYSE_DONNEES = ({
  context,
  question,
}: {
  context: string;
  question: string;
}) => `${SYSTEM_PROMPT_BASE}

Données à analyser :
${context}

Question : ${question}

Réponds avec cette structure :
## Résumé exécutif
(2-3 phrases max)

## Points clés
(3-5 points factuels tirés des données)

## Points d'attention
(risques ou anomalies détectés)

## Recommandations
(actions concrètes et priorisées)`;

/** Analyse de contrat — vision acheteur */
export const TEMPLATE_ANALYSE_CONTRAT = ({
  contractText,
  contractType,
}: {
  contractText: string;
  contractType: "supplier" | "cgv" | "other";
}) => `${SYSTEM_PROMPT_BASE}

Tu analyses un ${contractType === "supplier" ? "contrat fournisseur" : contractType === "cgv" ? "contrat CGV" : "contrat"} 
dans une optique acheteur. Extrais les informations suivantes au format JSON strict.

IMPORTANT : Si le texte contient des séparateurs de pages (ex. "--- Page X ---"), ignore-les et traite le document comme un texte continu.

Contrat à analyser :
${contractText}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "supplier_name": "string ou null",
  "buyer_name": "string ou null",
  "signatories": [{"name": "string", "role": "string", "date": "string ou null"}],
  "contract_date": "YYYY-MM-DD ou null",
  "start_date": "YYYY-MM-DD ou null",
  "end_date": "YYYY-MM-DD ou null",
  "renewal_date": "YYYY-MM-DD ou null",
  "termination_notice_days": "nombre ou null",
  "waiver_deadline": "YYYY-MM-DD ou null",
  "commitments": [
    {
      "type": "financial|operational|exclusivity|other",
      "description": "string",
      "amount": "nombre ou null",
      "currency": "EUR|USD|autre ou null",
      "deadline": "YYYY-MM-DD ou null",
      "party_responsible": "string ou null"
    }
  ],
  "payment_terms": "string ou null",
  "penalty_clauses": ["string"],
  "confidentiality": true|false,
  "exclusivity": true|false,
  "governing_law": "string ou null",
  "dispute_resolution": "string ou null",
  "executive_summary": "string (3-5 phrases en français)",
  "key_risks": ["string"],
  "key_opportunities": ["string"],
  "action_items": [{"action": "string", "deadline": "string ou null", "owner": "string ou null"}],
  "overall_risk_level": "low|medium|high"
}`;

/** Génération d'article wiki depuis des notes brutes */
export const TEMPLATE_WIKI_GENERATION = ({
  notes,
  articleType,
  workspace,
}: {
  notes: string;
  articleType: "guide" | "procedure" | "best-practice" | "reference";
  workspace: "service1" | "service2" | "shared";
}) => `${SYSTEM_PROMPT_BASE}

Génère un article wiki structuré de type "${articleType}" 
pour le workspace "${workspace === "service1" ? "Service 1" : workspace === "service2" ? "Service 2" : "partagé"}".

Notes brutes à structurer :
${notes}

Produis un article Markdown complet avec exactement cette structure :
# [Titre de l'article]

## Objectif
[Ce que cet article permet de faire ou comprendre]

## Contexte
[Pourquoi ce sujet est important, dans quel cadre]

## ${articleType === "procedure" ? "Procédure" : articleType === "guide" ? "Guide" : articleType === "best-practice" ? "Bonnes pratiques" : "Référence"}
[Contenu principal structuré]

## Points d'attention
[Erreurs fréquentes, précautions, cas particuliers]

## Références
[Documents liés, contacts, liens utiles si mentionnés dans les notes]`;

/** Mise en forme / amélioration d'un texte existant pour le wiki */
export const TEMPLATE_WIKI_FORMAT = ({
  content,
  title,
}: {
  content: string;
  title?: string;
}) => `${SYSTEM_PROMPT_BASE}

Tu dois améliorer et mettre en forme le texte suivant pour en faire un article wiki clair en Markdown.
${title ? `Titre suggéré ou contexte : ${title}` : ""}

Texte à améliorer :
---
${content}
---

Règles :
- Conserve le sens et les informations importantes.
- Structure en titres (##, ###), listes, paragraphes courts.
- Utilise du Markdown valide (listes, gras, liens si pertinent).
- Réponds UNIQUEMENT avec le contenu de l'article amélioré, sans commentaire avant ou après.`;

/** Synthèse stratégique */
export const TEMPLATE_SYNTHESE_STRATEGIQUE = ({
  context,
  question,
}: {
  context: string;
  question: string;
}) => `${SYSTEM_PROMPT_BASE}

Contexte :
${context}

Question : ${question}

Produis une synthèse stratégique avec :
## Situation actuelle
## Analyse
## Scénarios possibles
## Recommandation argumentée`;

// Export legacy pour compatibilité avec le code existant
export const templates = {
  analyse_donnees: TEMPLATE_ANALYSE_DONNEES,
  synthese_executive: TEMPLATE_SYNTHESE_STRATEGIQUE,
  recommandations: TEMPLATE_SYNTHESE_STRATEGIQUE,
};
