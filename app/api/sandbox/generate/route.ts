import { getSessionOrTestUser } from "@/lib/auth";
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
  const result = await getSessionOrTestUser();
  if (!result) return new Response("Unauthorized", { status: 401 });

  const { description } = (await req.json().catch(() => ({}))) as { description?: string };
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
