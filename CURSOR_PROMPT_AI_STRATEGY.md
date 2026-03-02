# 🧠 CURSOR PROMPT — Stratégie IA Blueprint Modular
# Quel modèle pour quel usage, comment l'intégrer

---

## CONTEXTE TECHNIQUE

Blueprint Modular tourne sur un VPS OVH (Ubuntu 24.04).
Le serveur IA est **Ollama** sur le même VPS, port 11434.
Modèles installés :
- `qwen3:8b` — modèle principal (meilleur français, raisonnement)
- `mistral:7b-instruct-q4_K_M` — modèle secondaire (backup)
- `nomic-embed-text` — embeddings pour la recherche sémantique

Le client Ollama est dans `lib/ai/vllm-client.ts` (classe `VLLMClient`).
La configuration est dans `lib/ai/config.ts` (variable `AI_CONFIG`).
Le registry des modules est dans `lib/ai/module-registry.ts`.
Les templates de prompts sont dans `lib/ai/prompt-templates.ts`.

**Règle fondamentale** : le LLM ne calcule jamais — il commente uniquement.
Tous les calculs numériques (croissance, ratios, agrégations) sont faits
en TypeScript/JavaScript AVANT d'être passés au LLM.

---

## ARCHITECTURE IA — 3 NIVEAUX D'USAGE

### NIVEAU 1 — Assistant Contextuel (déjà partiellement implémenté)

**Fichiers existants :**
- `components/ai/AIAssistant.tsx` ✅
- `app/api/ai/chat/route.ts` ✅
- `lib/ai/module-registry.ts` ✅
- `lib/ai/context-builder.ts` ✅

**Ce qui manque / à améliorer :**

Le `SYSTEM_PROMPT_BASE` dans `lib/ai/prompt-templates.ts` doit être enrichi
pour mieux guider Qwen3 sur les usages métier Blueprint Modular.

Remplace le contenu de `lib/ai/prompt-templates.ts` par :

```typescript
/**
 * Templates de prompts — français, adaptés au contexte métier Blueprint Modular.
 * Modèle cible : Qwen3:8b via Ollama local.
 * Règle absolue : le LLM commente, jamais il ne calcule.
 */

export const SYSTEM_PROMPT_BASE = `Tu es un assistant IA intégré à Blueprint Modular, 
un framework de gestion d'entreprise (ex. agroalimentaire, 120 collaborateurs) 
et BEAM Consulting (gestion d'investissements). 

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
  workspace: "production" | "beam" | "shared";
}) => `${SYSTEM_PROMPT_BASE}

Génère un article wiki structuré de type "${articleType}" 
pour le workspace "${workspace === "production" ? "Production" : workspace === "beam" ? "BEAM Consulting" : "partagé"}".

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
```

---

### NIVEAU 2 — Analyse Contractuelle

**Fichiers existants :**
- `app/api/contracts/` ✅ (routes CRUD)
- `lib/ai/contract-analyzer.ts` ✅ (à vérifier/compléter)
- `lib/contract-extract.ts` ✅ (extraction texte PDF/DOCX)

**Modèle utilisé : `qwen3:8b`**

**Règles d'implémentation :**

1. L'analyse se déclenche à l'upload — jamais à chaque consultation
2. Le résultat est stocké en base (champ `extracted_data` JSON dans Prisma)
3. Le LLM reçoit le texte brut du contrat et retourne du JSON strict
4. Parser robuste obligatoire — Qwen3 peut ajouter du texte autour du JSON

Dans `lib/ai/contract-analyzer.ts`, assure-toi que :

```typescript
// Pattern de parsing robuste — extrait le JSON même si le LLM ajoute du texte
function extractJSON(response: string): string {
  // Cherche le premier { et le dernier }
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Pas de JSON trouvé dans la réponse");
  return response.slice(start, end + 1);
}

// Dans la méthode analyze() :
// 1. Utiliser TEMPLATE_ANALYSE_CONTRAT depuis prompt-templates.ts
// 2. Appeler vllmClient.chat() avec stream: false (pas de streaming pour JSON)
// 3. Parser avec extractJSON() puis JSON.parse()
// 4. Valider les champs critiques (au minimum: executive_summary, overall_risk_level)
// 5. Retourner un objet partiel si certains champs sont absents (ne pas planter)
```

**Séparation des workspaces :**
Chaque contrat a un champ `workspace: "production" | "beam"`.
Les requêtes API filtrent TOUJOURS par workspace.
Ne jamais retourner des contrats d'un workspace dans une requête d'un autre.

---

### NIVEAU 3 — Wiki IA

**Fichiers existants :**
- `app/api/wiki/` ✅ (routes CRUD)
- `app/(app)/modules/wiki/` ✅ (pages)

**Modèle utilisé : `qwen3:8b`**

**Nouvelle route à créer :**

```
POST /api/wiki/generate
Body: { notes: string, articleType: string, workspace: string }
Response: stream SSE (même format que /api/ai/chat)
```

Dans `app/api/wiki/generate/route.ts` :

```typescript
// 1. Valider les paramètres (notes non vide, articleType valide, workspace valide)
// 2. Construire le prompt avec TEMPLATE_WIKI_GENERATION
// 3. Appeler vllmClient.chatStream() pour le streaming
// 4. Retourner un ReadableStream SSE identique au format de /api/ai/chat
//    (data: { type: "chunk", t: "..." } puis data: { type: "done" })
// 5. NE PAS sauvegarder automatiquement — l'utilisateur valide avant publication
```

---

## RÈGLES D'ARCHITECTURE À RESPECTER

### Côté serveur uniquement
Tous les appels Ollama passent par des API Routes Next.js.
**Jamais d'appel direct au VPS depuis le frontend.**
Le frontend appelle `/api/ai/chat`, `/api/contracts/analyze`, `/api/wiki/generate`.
Ces routes appellent Ollama en `http://localhost:11434` (loopback — même serveur).

### Modèle unique pour tous les usages Phase 1
`qwen3:8b` pour tout : assistant, contrats, wiki.
Le modèle est configuré dans `AI_CONFIG.model` dans `lib/ai/config.ts`.
Pour changer de modèle, on change uniquement cette variable d'env.

### Streaming obligatoire pour l'UI
Tous les endpoints qui répondent à l'utilisateur utilisent `chatStream()`.
Seule l'analyse contractuelle (qui produit du JSON) utilise `chat()` sans stream.
Le format SSE est toujours : `data: { type: "chunk"|"done"|"error", t?: string }`

### Gestion des erreurs Ollama
Si Ollama est indisponible (timeout, restart), retourner une erreur claire :
```typescript
{ type: "error", message: "Le serveur IA est temporairement indisponible. Réessayez dans quelques instants." }
```
Ne jamais exposer l'URL interne du VPS dans les messages d'erreur.

### Timeout adapté à la lenteur CPU
Le VPS tourne en CPU-only. Les temps de réponse sont de 30-60 secondes.
`AI_TIMEOUT=120` (2 minutes) dans `.env.local` — ne pas réduire.
Le streaming masque cette latence côté utilisateur.

---

## CE QUE CURSOR NE DOIT PAS FAIRE

- ❌ Ajouter des dépendances npm liées à l'IA (langchain, openai, etc.)
- ❌ Appeler Ollama depuis un composant React client
- ❌ Faire des calculs arithmétiques dans les prompts
- ❌ Stocker l'URL du VPS dans le code source (uniquement dans .env)
- ❌ Modifier `vllm-client.ts` ou `config.ts` — ils viennent d'être migrés
- ❌ Mélanger les données Production et BEAM dans la même requête

---

## RÉSUMÉ — QUI FAIT QUOI

| Tâche | Qui | Fichier |
|---|---|---|
| Calculs numériques | TypeScript | context-builder.ts |
| Formatage du contexte | TypeScript | context-builder.ts |
| Appel Ollama | Serveur uniquement | vllm-client.ts |
| Routing des requêtes IA | Next.js API Routes | app/api/ai/chat/route.ts |
| Templates de prompts | prompt-templates.ts | prompt-templates.ts |
| Analyse JSON contrats | contract-analyzer.ts | contract-analyzer.ts |
| Génération wiki | app/api/wiki/generate | route.ts |
| Affichage streaming | React client | AIAssistant.tsx |
