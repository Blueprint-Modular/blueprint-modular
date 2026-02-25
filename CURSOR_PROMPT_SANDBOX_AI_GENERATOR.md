# 🤖 CURSOR PROMPT — Générateur IA dans la Sandbox BPM
# Ajoute un mode "Par IA" à la Sandbox existante

---

## CONTEXTE

La Sandbox (`app/(app)/sandbox/page.tsx`) a déjà deux modes :
- "Par code" — textarea avec autocomplétion `bpm.*` + preview en direct
- "Par composant" — sélecteur visuel

On ajoute un **troisième mode "Par IA"** :
L'utilisateur décrit en français ce qu'il veut → Ollama génère le code `bpm.*` → 
le code s'insère dans le textarea existant → le preview se met à jour automatiquement.

Le générateur réutilise EXACTEMENT l'infrastructure existante :
- `vllmClient.chatStream()` de `lib/ai/vllm-client.ts`
- Le parser `parseCodeToPreview()` déjà dans la page
- Le state `code` déjà dans la page
- Le format SSE déjà géré dans `AIAssistant.tsx`

---

## COMPOSANTS BPM DISPONIBLES (référence complète pour le system prompt)

Voici TOUS les composants que le LLM peut utiliser, avec leur syntaxe exacte :

```
bpm.title("Texte", level=1)           # level: 1|2|3
bpm.metric("Label", "Valeur", delta=3.2, border=True)
bpm.button("Texte")
bpm.panel("Titre", "Contenu", variant="info")  # variant: info|success|warning|error
bpm.message("Texte", type="success")   # type: info|success|warning|error
bpm.spinner(text="Chargement…")
bpm.codeblock("code ici", language="python")  # language: python|javascript
bpm.linechart("Jan,10;Fév,20;Mar,15")
bpm.barchart("A,30;B,45;C,25")
bpm.badge("Texte", variant="primary")  # variant: default|primary|success|warning|error
bpm.card("Titre", "Contenu", variant="outlined")
bpm.input("Label", placeholder="…")
bpm.textarea("Label", rows=4)
bpm.checkbox("Label", checked=True)
bpm.toggle("Label", value=True)
bpm.selectbox("Label", options="A,B,C")
bpm.accordion("Titre1|Contenu1;Titre2|Contenu2")
bpm.expander("Titre", expanded=False)
bpm.avatar(name="AB", size="medium")   # size: small|medium|large
bpm.slider("Label", min=0, max=100, value=50)
bpm.progress(value=70, max=100, label="Avancement")
bpm.skeleton(variant="text")           # variant: text|rectangular
bpm.breadcrumb("Accueil,Docs,Sandbox")
bpm.divider()
bpm.emptystate("Titre", description="Description")
bpm.chip("Label", variant="primary")
bpm.stepper(steps="Étape1,Étape2,Étape3", current=1)
bpm.markdown("## Titre\n\nTexte **gras**")
bpm.statusbox(state="complete", label="Succès")  # state: complete|running|error
bpm.numberinput("Label", value=42, min=0, max=100)
bpm.dateinput("Label")
bpm.radiogroup("Label", options="X,Y,Z", value="X")
bpm.rating(value=3, max=5)
bpm.colorpicker("Label", value="#3b82f6")
bpm.grid(cols=3)   # suivi de bpm.panel() pour chaque colonne
bpm.areachart("Jan,10;Fév,25;Mar,18")
bpm.highlightbox(value=1, label="Important", title="Titre")
bpm.empty("Aucune donnée")
bpm.jsonviewer(data='{"key": "value"}')
```

---

## MODIFICATIONS À APPORTER

### 1. Nouvelle API Route : `app/api/sandbox/generate/route.ts`

Crée ce fichier. Il reçoit une description en français et retourne un stream SSE
avec le code `bpm.*` généré par Ollama.

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vllmClient } from "@/lib/ai/vllm-client";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_GENERATOR = `Tu es un générateur de code pour Blueprint Modular.
Tu réponds TOUJOURS en français.
Tu génères UNIQUEMENT des lignes de code bpm.* valides, rien d'autre.
Pas d'explication, pas de commentaire, pas de markdown, pas de backticks.
Juste les appels bpm.* ligne par ligne.

Composants disponibles et leur syntaxe exacte :
bpm.title("Texte", level=1)
bpm.metric("Label", "Valeur", delta=3.2, border=True)
bpm.button("Texte")
bpm.panel("Titre", "Contenu", variant="info")
bpm.message("Texte", type="success")
bpm.spinner(text="Chargement…")
bpm.codeblock("code", language="python")
bpm.linechart("Jan,10;Fév,20;Mar,15")
bpm.barchart("A,30;B,45;C,25")
bpm.areachart("Jan,10;Fév,25;Mar,18")
bpm.badge("Texte", variant="primary")
bpm.card("Titre", "Contenu", variant="outlined")
bpm.input("Label", placeholder="…")
bpm.textarea("Label", rows=4)
bpm.checkbox("Label", checked=True)
bpm.toggle("Label", value=True)
bpm.selectbox("Label", options="A,B,C")
bpm.accordion("Titre1|Contenu1;Titre2|Contenu2")
bpm.expander("Titre", expanded=False)
bpm.avatar(name="AB", size="medium")
bpm.slider("Label", min=0, max=100, value=50)
bpm.progress(value=70, max=100, label="Avancement")
bpm.skeleton(variant="text")
bpm.breadcrumb("Accueil,Docs,Page")
bpm.divider()
bpm.emptystate("Titre", description="Description")
bpm.chip("Label", variant="primary")
bpm.stepper(steps="Étape1,Étape2,Étape3", current=1)
bpm.markdown("## Titre\n\nTexte **gras**")
bpm.statusbox(state="complete", label="Succès")
bpm.numberinput("Label", value=42, min=0, max=100)
bpm.dateinput("Label")
bpm.radiogroup("Label", options="X,Y,Z", value="X")
bpm.rating(value=3, max=5)
bpm.colorpicker("Label", value="#3b82f6")
bpm.highlightbox(value=1, label="Important", title="Titre")
bpm.empty("Aucune donnée")
bpm.jsonviewer(data='{"key": "value"}')
bpm.grid(cols=3)

Règles strictes :
- Une seule instruction par ligne
- Utilise des données d'exemple réalistes (pas "lorem ipsum", pas "texte")
- Pour les métriques financières, utilise des valeurs vraisemblables (ex: "142 500 €")
- Pour les graphiques, génère 4-6 points de données cohérents
- Commence toujours par bpm.title() pour nommer la page
- Maximum 15 lignes de code`;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { description } = await req.json().catch(() => ({})) as { description?: string };
  if (!description?.trim()) {
    return new Response(JSON.stringify({ error: "description required" }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await vllmClient.chatStream(
          [
            { role: "system", content: SYSTEM_PROMPT_GENERATOR },
            { role: "user", content: `Génère le code BPM pour : ${description}` },
          ],
          (chunk) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`)
            );
          }
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur génération";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

---

### 2. Modification de `app/(app)/sandbox/page.tsx`

**Ne pas réécrire le fichier entier.** Appliquer uniquement ces 4 modifications chirurgicales.

#### 2a. Ajouter le state du mode IA (dans `SandboxContent`)

Après la ligne :
```typescript
const [mode, setMode] = useState<"selector" | "code">("code");
```

Remplace par :
```typescript
const [mode, setMode] = useState<"selector" | "code" | "ai">("code");
const [aiDescription, setAiDescription] = useState("");
const [aiGenerating, setAiGenerating] = useState(false);
const [aiError, setAiError] = useState<string | null>(null);
```

#### 2b. Ajouter la fonction `generateFromAI` (dans `SandboxContent`, après les autres fonctions)

Ajoute cette fonction juste avant le `return` de `SandboxContent` :

```typescript
const generateFromAI = useCallback(async () => {
  if (!aiDescription.trim() || aiGenerating) return;
  setAiGenerating(true);
  setAiError(null);
  setCode("# Génération en cours…");

  try {
    const res = await fetch("/api/sandbox/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: aiDescription }),
    });

    if (!res.ok) {
      setAiError(`Erreur ${res.status}`);
      setCode("");
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
            if (data.type === "chunk" && data.t) {
              full += data.t;
              // Filtre les lignes non-bpm en temps réel
              const validLines = full
                .split("\n")
                .filter((l) => l.trim().startsWith("bpm.") || l.trim() === "" || l.trim().startsWith("#"))
                .join("\n");
              setCode(validLines);
            }
            if (data.type === "error") {
              setAiError(data.message ?? "Erreur inconnue");
            }
          } catch { /* ignore */ }
        }
      }
    }
    // Bascule automatiquement en mode code pour voir le résultat
    setMode("code");
  } catch (err) {
    setAiError(err instanceof Error ? err.message : "Erreur réseau");
    setCode("");
  } finally {
    setAiGenerating(false);
  }
}, [aiDescription, aiGenerating]);
```

#### 2c. Ajouter le bouton "Par IA" dans la barre de modes

Trouve le bloc des deux boutons de mode (celui qui contient "Par code" et "Par composant") et ajoute un troisième bouton :

```typescript
<button
  type="button"
  onClick={() => setMode("ai")}
  className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
  style={{
    background: mode === "ai" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
    color: mode === "ai" ? "#fff" : "var(--bpm-text-primary)",
    border: "1px solid var(--bpm-border)",
  }}
>
  ✦ Par IA
</button>
```

#### 2d. Ajouter le panneau du mode IA (après le bloc `{mode === "selector" && ...}`)

```typescript
{mode === "ai" && (
  <div
    className="rounded-lg border p-4 mb-4"
    style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
  >
    <label
      className="block text-xs font-semibold mb-2"
      style={{ color: "var(--bpm-text-secondary)" }}
    >
      Décrivez la page que vous voulez générer
    </label>
    <textarea
      value={aiDescription}
      onChange={(e) => setAiDescription(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          generateFromAI();
        }
      }}
      placeholder={
        "Exemples :\n" +
        "• Un dashboard avec le CA mensuel, le taux de marge et un graphique de tendance\n" +
        "• Une page de suivi de contrats avec statut et date d'échéance\n" +
        "• Un formulaire de saisie de commande fournisseur"
      }
      rows={4}
      className="w-full rounded border px-3 py-2 text-sm resize-none mb-3"
      style={{
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg-secondary)",
        color: "var(--bpm-text-primary)",
      }}
    />
    {aiError && (
      <p className="text-sm mb-3" style={{ color: "var(--bpm-accent)" }}>
        ⚠ {aiError}
      </p>
    )}
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={generateFromAI}
        disabled={aiGenerating || !aiDescription.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium transition"
        style={{
          background: aiGenerating || !aiDescription.trim()
            ? "var(--bpm-border)"
            : "var(--bpm-accent-cyan)",
          color: aiGenerating || !aiDescription.trim()
            ? "var(--bpm-text-secondary)"
            : "#fff",
          cursor: aiGenerating || !aiDescription.trim() ? "not-allowed" : "pointer",
        }}
      >
        {aiGenerating ? "Génération…" : "✦ Générer"}
      </button>
      {aiGenerating && (
        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          Assistant génère votre page (~30-60s)…
        </span>
      )}
      {!aiGenerating && (
        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          Cmd+Entrée pour lancer · Le résultat s&apos;ouvrira en mode &quot;Par code&quot;
        </span>
      )}
    </div>
  </div>
)}
```

---

## CE QU'IL NE FAUT PAS MODIFIER

- Le parser `parseBpmLine()` — ne pas toucher
- Le state `code` et `setCode` — réutilisés tels quels
- La fonction `parseCodeToPreview()` — ne pas toucher
- L'autocomplétion — ne pas toucher
- Les modes "Par code" et "Par composant" — ne pas toucher
- `lib/ai/vllm-client.ts` et `lib/ai/config.ts` — ne pas toucher

---

## RÉSULTAT ATTENDU

1. Sandbox affiche 3 onglets : "Par code" | "Par composant" | "✦ Par IA"
2. En mode IA : textarea de description + bouton "Générer"
3. Clic → appel `/api/sandbox/generate` → stream SSE
4. Le code `bpm.*` arrive en streaming dans le state `code`
5. Bascule auto vers "Par code" quand la génération est terminée
6. Le preview en direct affiche la page générée immédiatement

## TEST DE VALIDATION

Taper : "Un dashboard financier avec le chiffre d'affaires, le taux de marge, 
un graphique de ventes mensuelles et un indicateur de statut"

Résultat attendu (exemple) :
```
bpm.title("Dashboard Financier", level=1)
bpm.metric("Chiffre d'affaires", "1 245 000 €", delta=3.2)
bpm.metric("Taux de marge", "18,5 %", delta=-0.8)
bpm.barchart("Jan,98000;Fév,112000;Mar,125000;Avr,118000;Mai,134000;Jun,145000")
bpm.statusbox(state="complete", label="Objectif Q2 atteint")
```
