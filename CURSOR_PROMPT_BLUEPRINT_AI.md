# 🤖 CURSOR MEGA-PROMPT — Blueprint Modular AI Layer
# Une nuit pour construire la Phase 1 complète

---

## 🔍 ÉTAPE 0 — ANALYSE PRÉLIMINAIRE (OBLIGATOIRE)

Avant d'écrire une seule ligne de code, tu dois :

1. Lire et cartographier l'intégralité du projet Blueprint Modular existant
2. Identifier la structure des dossiers (frontend / backend / shared)
3. Détecter si un backend FastAPI existe déjà (cherche `main.py`, `app.py`, `api/`, `backend/`)
4. Lister tous les composants bpm.* existants (bpm.tabs, bpm.table, bpm.panel, bpm.metric, bpm.toggle, etc.)
5. Identifier comment les données sont actuellement exposées dans les modules (props, context, store, API calls)
6. Identifier le système de routing React existant

Produis un rapport d'analyse AVANT de commencer :
```
ANALYSE BLUEPRINT MODULAR
=========================
Structure détectée : [...]
Backend existant : OUI/NON — [détails]
Composants bpm.* trouvés : [liste]
Pattern de données : [comment les modules exposent leurs données]
Routing : [React Router / autre]
Points d'attention : [conflits potentiels, conventions à respecter]
```

Ne commence le développement qu'après avoir produit ce rapport.

---

## 🎯 CONTEXTE GÉNÉRAL

Tu travailles sur **Blueprint Modular**, un framework React modulaire avec composants `bpm.*`.
L'application est déployée sur `https://app.blueprint-modular.com/dashboard`.

La **couche IA locale** est connectée à **Ollama** (modèle **Qwen3:8b** par défaut), pas OpenAI ni cloud — tout en local. Le client appelle Ollama via les API Routes Next.js (`app/api/ai/`), jamais depuis le frontend.

Variables d’environnement : `AI_SERVER_URL` (URL Ollama, ex. `http://localhost:11434`), `AI_MOCK=true` (dév sans serveur). Voir `lib/ai/config.ts`.

---

## 📦 CE QUE TU DOIS CONSTRUIRE — PHASE 1

### MODULE 1 — Assistant IA Contextuel (clone d'Oliver)

**Description**
Un panneau de chat IA flottant, accessible depuis n'importe quelle page du dashboard. L'assistant "voit" tous les modules actifs de l'application et peut répondre à des questions sur leurs données.

**Fichiers existants (à étendre, pas à recréer)**

```
lib/ai/
├── vllm-client.ts      # Client Ollama (chat, chatStream, healthCheck)
├── config.ts           # AI_CONFIG (baseUrl, model, timeout, mock)
├── context-builder.ts  # Données des modules → texte pour le LLM
├── module-registry.ts  # Registry des modules et leurs données
├── prompt-templates.ts # SYSTEM_PROMPT_BASE, TEMPLATE_*, etc.
└── contract-analyzer.ts # Analyse JSON contrats

app/api/ai/
├── chat/route.ts       # POST, stream SSE (provider vllm par défaut)
└── health/route.ts     # Statut Ollama

components/ai/
└── AIAssistant.tsx     # Panneau chat + contexte modules
```

**Convention client IA** : les appels Ollama se font **uniquement** depuis les API Routes (côté serveur). Le frontend appelle `/api/ai/chat` ; la config est dans `lib/ai/config.ts` (variables d’env `AI_SERVER_URL`, `AI_MOCK`, `AI_MODEL`).

**Spécifications module_registry.js**
```javascript
// Registry global — chaque module de l'app peut s'y enregistrer

class ModuleRegistry {
  register(moduleId, {
    label,        // Nom affiché à l'utilisateur
    tags,         // ['portfolio', 'kpi', 'finance', etc.]
    getData,      // () => { dataframes, metrics, charts }
    description,  // Description courte pour le contexte IA
  }) {}
  
  unregister(moduleId) {}
  
  getModulesByTags(tags) {}
  
  getAllModules() {}
  
  // Retourne le contexte formaté pour tous les modules sélectionnés
  buildContext(selectedModuleIds) {}
}

// Export singleton
export const registry = new ModuleRegistry()

// Hook React pour l'enregistrement automatique
export function useRegisterModule(moduleId, config) {
  // S'enregistre au mount, se désenregistre au unmount
}
```

**Spécifications context_builder.js**
```javascript
// Transforme les données brutes des modules en texte exploitable par le LLM

class ContextBuilder {
  // DataFrame (array d'objets) → texte structuré
  dataframeToText(data, { maxRows = 50, label = '' } = {}) {}
  
  // Métriques (objet clé/valeur) → résumé lisible
  metricsToText(metrics, { label = '' } = {}) {}
  
  // Données de graphique → description textuelle
  chartToText(chartData, { type, label = '' } = {}) {}
  
  // Assemble le contexte complet depuis plusieurs modules
  buildFullContext(modules) {
    // Limite automatique à 4000 tokens (estimation)
    // Tronque intelligemment si dépassement
    // Retourne le texte structuré + metadata (nb tokens estimé)
  }
  
  estimateTokens(text) {
    // Estimation rapide : nb mots * 1.3
  }
}
```

**Spécifications prompt_templates.js**
```javascript
// Templates de prompts par type d'analyse
// IMPORTANT : prompts en français, adaptés au contexte métier

const SYSTEM_PROMPT = `Tu es un assistant IA intégré à Blueprint Modular, 
un framework de gestion d'entreprise. Tu as accès aux données en temps réel 
de l'application. Tu réponds en français, de manière précise et structurée.
Tu ne fais jamais d'hypothèses sur des données que tu n'as pas reçues.`

const templates = {
  analyse_donnees: ({ context, question }) => `...`,
  synthese_executive: ({ context, question }) => `...`,
  recommandations: ({ context, question }) => `...`,
}
```

**Spécifications AIAssistant.jsx**
- Panneau latéral droit, largeur 420px, hauteur 100vh
- Toggle via bouton flottant (icône IA) en bas à droite
- En-tête : statut du serveur IA (vert/rouge), modèle actif, bouton reset
- Sélecteur de contexte : liste des modules disponibles avec tags, checkboxes
- Zone de chat : messages avec markdown rendu, scroll automatique
- Input : textarea multilignes, Cmd+Enter pour envoyer, bouton send
- Indicateur de streaming : points animés pendant la génération
- Utilise exclusivement les composants `bpm.*` existants pour le style
- Responsive : se replie en modal sur mobile

---

### MODULE 2 — Base Contractuelle Acheteurs

**Description**
Système d'ingestion et d'analyse de contrats (fournisseurs et CGV). Chaque document est analysé une fois à l'upload, et les informations clés sont extraites et stockées en base. Interface de consultation et de recherche.

**Fichiers à créer**

```
src/
├── contracts/
│   ├── components/
│   │   ├── ContractUpload.jsx      # Upload de documents (PDF, DOCX, TXT)
│   │   ├── ContractList.jsx        # Liste des contrats avec filtres
│   │   ├── ContractCard.jsx        # Carte résumé d'un contrat
│   │   ├── ContractDetail.jsx      # Vue détaillée d'un contrat analysé
│   │   ├── ContractAnalysisBadge.jsx # Badge statut (En cours / Analysé / Erreur)
│   │   └── ContractSearch.jsx      # Recherche plein texte dans les méta-analyses
│   ├── hooks/
│   │   ├── useContracts.js         # CRUD contrats
│   │   └── useContractAnalysis.js  # Déclenche et suit l'analyse IA
│   ├── services/
│   │   └── contractService.js      # API calls vers le backend
│   └── utils/
│       └── contractParser.js       # Parsing côté client (extraction texte basique)

backend/  (ou api/ selon ce qui existe)
├── contracts/
│   ├── router.py                   # FastAPI router /api/contracts
│   ├── models.py                   # Modèles SQLAlchemy
│   ├── schemas.py                  # Schémas Pydantic
│   ├── service.py                  # Logique métier
│   ├── analyzer.py                 # Pipeline d'analyse IA
│   └── extractor.py                # Extraction texte (PyMuPDF pour PDF, python-docx)
```

**Schéma de données — Contract**
```python
class Contract(Base):
    id: UUID
    
    # Identité
    title: str                    # Nom du fichier / titre détecté
    contract_type: str            # 'supplier' | 'cgv' | 'other'
    workspace: str                # 'production' | 'beam'  ← bases séparées
    
    # Fichier
    file_path: str
    file_hash: str                # Pour éviter les doublons
    original_filename: str
    file_size_bytes: int
    
    # Statut
    status: str                   # 'pending' | 'analyzing' | 'done' | 'error'
    analysis_progress: int        # 0-100
    
    # Méta-analyse extraite par l'IA
    extracted_data: JSON {
      # Parties
      supplier_name: str
      buyer_name: str
      signatories: list[{name, role, date}]
      
      # Dates clés
      contract_date: date
      start_date: date
      end_date: date
      renewal_date: date
      termination_notice_days: int
      waiver_deadline: date       # Date limite de renonciation
      
      # Engagements
      commitments: list[{
        type: str,                # 'financial' | 'operational' | 'exclusivity' | etc.
        description: str,
        amount: float | None,
        currency: str | None,
        deadline: date | None,
        party_responsible: str
      }]
      
      # Clauses importantes
      payment_terms: str
      penalty_clauses: list[str]
      confidentiality: bool
      exclusivity: bool
      governing_law: str
      dispute_resolution: str
      
      # Synthèse
      executive_summary: str      # 3-5 phrases
      key_risks: list[str]
      key_opportunities: list[str]
      action_items: list[{action, deadline, owner}]
      overall_risk_level: str     # 'low' | 'medium' | 'high'
    }
    
    # Timestamps
    created_at: datetime
    analyzed_at: datetime | None
    updated_at: datetime
```

**Spécifications analyzer.py**
```python
class ContractAnalyzer:
    """
    Pipeline d'analyse IA d'un contrat.
    Appelle Ollama local (via lib/ai) — JAMAIS d'API externe.
    """
    
    def __init__(self, llm_base_url: str):
        # En pratique : l'analyse est faite dans lib/ai/contract-analyzer.ts (Next.js)
        pass
    
    async def analyze(self, contract_text: str, contract_type: str) -> dict:
        """
        1. Découpe le texte en chunks si > 3000 tokens
        2. Extrait les métadonnées structurées (JSON forcé)
        3. Génère la synthèse executive
        4. Identifie les risques et opportunités
        5. Retourne le dict extracted_data complet
        """
        pass
    
    def _build_extraction_prompt(self, text: str, contract_type: str) -> str:
        """
        Prompt en français, demande une réponse JSON strict.
        Adapté selon contract_type ('supplier' vs 'cgv').
        Inclut des exemples few-shot pour guider le modèle.
        """
        pass
    
    def _parse_llm_json_response(self, response: str) -> dict:
        """
        Parse robuste — gère les cas où le LLM ajoute du texte autour du JSON.
        Retourne un dict valide ou lève ContractAnalysisError.
        """
        pass
```

**Interface ContractList.jsx**
- Filtres : workspace (production / BEAM), type, statut, période
- Colonnes : nom, fournisseur, type, date contrat, date fin, risque (badge coloré), statut analyse
- Tri sur toutes les colonnes
- Clic sur une ligne → ContractDetail
- Bouton upload en haut à droite
- Indicateur de progression pour les analyses en cours (polling toutes les 3s)
- Utilise `bpm.table`

**Interface ContractDetail.jsx**
- Vue en deux colonnes : infos structurées | synthèse narrative
- Sections : Parties & signataires | Dates clés (timeline) | Engagements | Clauses | Risques/Opportunités | Actions
- Bouton "Ré-analyser" (force une nouvelle analyse)
- Bouton "Poser une question" (ouvre l'assistant IA avec ce contrat en contexte)

---

### MODULE 3 — Wiki Interne

**Description**
Système de gestion de connaissances intégré : guides utilisateurs, procédures, bonnes pratiques. L'IA peut générer des articles à partir de notes brutes et le wiki est aussi une source de contexte pour l'assistant (Module 1).

**Fichiers à créer**

```
src/
├── wiki/
│   ├── components/
│   │   ├── WikiHome.jsx            # Page d'accueil wiki (catégories + search)
│   │   ├── WikiArticle.jsx         # Lecture d'un article (markdown rendu)
│   │   ├── WikiEditor.jsx          # Éditeur markdown avec preview
│   │   ├── WikiSidebar.jsx         # Navigation par catégories et tags
│   │   ├── WikiSearch.jsx          # Recherche plein texte
│   │   └── WikiAIGenerator.jsx     # Interface de génération IA d'articles
│   ├── hooks/
│   │   ├── useWiki.js              # CRUD articles
│   │   └── useWikiAI.js            # Génération IA
│   └── services/
│       └── wikiService.js

backend/
├── wiki/
│   ├── router.py                   # FastAPI router /api/wiki
│   ├── models.py
│   ├── schemas.py
│   └── service.py
```

**Schéma WikiArticle**
```python
class WikiArticle(Base):
    id: UUID
    title: str
    slug: str                     # URL-friendly
    category: str                 # 'guide' | 'procedure' | 'best-practice' | 'reference'
    tags: list[str]
    content: str                  # Markdown
    summary: str                  # Auto-généré (2-3 phrases)
    workspace: str                # 'production' | 'beam' | 'shared'
    author: str
    ai_generated: bool
    source_notes: str | None      # Notes brutes ayant servi à la génération
    created_at: datetime
    updated_at: datetime
    version: int                  # Incrémenté à chaque modification
```

**WikiAIGenerator.jsx**
- Textarea "Notes brutes" (coller du texte non structuré)
- Sélecteur de type d'article (guide / procédure / bonne pratique)
- Sélecteur de workspace (Production / BEAM / Partagé)
- Bouton "Générer l'article" → appelle le LLM → affiche la preview markdown
- Bouton "Modifier avant publication" → ouvre WikiEditor avec le contenu généré
- Bouton "Publier directement"

**Template de génération wiki**
```
Structure demandée au LLM :
# [Titre]
## Objectif
## Contexte
## Procédure / Contenu principal
## Bonnes pratiques
## Points d'attention
## Références
```

---

## ⚙️ BACKEND — Si inexistant, créer de zéro

Si aucun backend n'est détecté lors de l'analyse préliminaire, créer :

```
backend/
├── main.py                       # FastAPI app, CORS, routers
├── config.py                     # Settings (pydantic-settings)
├── database.py                   # SQLAlchemy async engine + session
├── requirements.txt
├── .env.example
└── alembic/                      # Migrations
    ├── alembic.ini
    └── versions/
```

**config.py**
```python
class Settings(BaseSettings):
    # Base
    APP_NAME: str = "Blueprint Modular API"
    DEBUG: bool = False
    
    # Base de données
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/blueprint"
    
    # IA — serveur Ollama local
    AI_SERVER_URL: str = "http://localhost:8000"
    AI_MODEL: str = "mixtral-8x7b-instruct"
    AI_TIMEOUT: int = 120
    AI_MAX_RETRIES: int = 2
    
    # Stockage fichiers
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "https://app.blueprint-modular.com"]
```

**Endpoints requis**

```
# AI
GET  /api/ai/health              → statut du serveur Ollama
POST /api/ai/chat                → chat générique (stream SSE)

# Contracts
GET  /api/contracts              → liste avec filtres (workspace, type, status)
POST /api/contracts/upload       → upload + déclenchement analyse async
GET  /api/contracts/{id}         → détail complet
GET  /api/contracts/{id}/status  → statut de l'analyse (polling)
POST /api/contracts/{id}/reanalyze → force une nouvelle analyse
DELETE /api/contracts/{id}

# Wiki
GET  /api/wiki/articles          → liste avec search + filtres
POST /api/wiki/articles          → créer un article
GET  /api/wiki/articles/{slug}   → lire un article
PUT  /api/wiki/articles/{slug}   → modifier
DELETE /api/wiki/articles/{slug}
POST /api/wiki/generate          → génération IA depuis notes brutes (stream SSE)

# Module Registry (pour l'assistant contextuel)
POST /api/ai/context             → reçoit les données de modules, retourne contexte formaté
```

---

## 🎨 CONVENTIONS UI — À RESPECTER ABSOLUMENT

1. **Composants bpm.*** — utilise TOUJOURS les composants existants. Jamais de HTML natif si un composant bpm.* existe.
2. **Notation** — `bpm.tabs`, `bpm.table`, `bpm.panel`, `bpm.metric`, `bpm.toggle` (minuscules, point)
3. **Pas de bibliothèques UI externes** — pas de Material UI, Ant Design, Chakra. Blueprint Modular est auto-suffisant.
4. **Couleurs et thème** — respecte les variables CSS existantes du projet
5. **Responsive** — tous les composants doivent fonctionner sur mobile (≥ 375px)
6. **Français** — toute l'interface est en français

---

## 🔒 SÉCURITÉ ET DONNÉES

1. **Séparation des workspaces** — Production et BEAM ont des données strictement séparées. Chaque requête doit inclure et valider le workspace. Ne jamais retourner des données d'un workspace dans une requête d'un autre.
2. **Validation des fichiers** — à l'upload, vérifier extension (PDF, DOCX, TXT) ET type MIME réel
3. **Taille max** — 50 Mo par fichier
4. **Sanitisation** — tout texte extrait des documents doit être sanitisé avant d'être injecté dans un prompt

---

## 🧪 MOCKS DE DÉVELOPPEMENT

Pour travailler sans le serveur Ollama :

```bash
# .env.local
AI_MOCK=true
AI_SERVER_URL=http://localhost:11434
```

Le client dans `lib/ai/vllm-client.ts` utilise `AI_CONFIG.mock` et retourne des réponses mockées lorsque `AI_MOCK=true`.

Exemples de réponses mockées à prévoir :
- Analyse de portefeuille → texte de synthèse structurée
- Analyse de contrat → JSON complet avec champs fictifs cohérents
- Génération wiki → article markdown complet

---

## 📋 ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

1. **Analyse préliminaire** (rapport obligatoire)
2. **Backend de base** (si inexistant) + connexion DB + migrations
3. **lib/ai (vllm-client + config + mocks)** (fondation de tout le reste)
4. **module-registry.ts + context-builder.ts**
5. **AIAssistant.tsx** (Module 1 complet)
6. **Backend contracts** (models + analyzer + router)
7. **ContractUpload + ContractList + ContractDetail** (Module 2 complet)
8. **Backend wiki** (models + router)
9. **WikiHome + WikiEditor + WikiAIGenerator** (Module 3 complet)
10. **Intégration finale** : enregistrement des modules contracts et wiki dans le registry (l'assistant peut alors répondre à des questions sur les contrats et le wiki)
11. **Tests** : vérifier les 3 modules + l'assistant sur données mockées

---

## ✅ CRITÈRES DE SUCCÈS

À la fin de la nuit, le développement est réussi si :

- [ ] L'assistant IA s'ouvre depuis le dashboard et répond à "quels modules sont disponibles ?"
- [ ] L'assistant peut répondre à une question sur les données d'un module enregistré
- [ ] On peut uploader un PDF contrat et voir l'analyse se lancer (mock ou réel)
- [ ] La liste des contrats s'affiche avec filtres Production / BEAM séparés
- [ ] On peut créer un article wiki manuellement
- [ ] On peut générer un article wiki depuis des notes brutes
- [ ] Aucune dépendance vers OpenAI, ChatGPT ou tout service cloud IA

---

## ⚠️ QUESTIONS À POSER AVANT DE COMMENCER

Si quelque chose n'est pas clair après l'analyse préliminaire, demande avant d'implémenter. En particulier :
- La structure exacte des composants bpm.* (props, conventions)
- Le système d'auth existant (pour lier les données aux workspaces)
- La convention de nommage des fichiers dans ce projet

**Ne suppose pas — demande.**
