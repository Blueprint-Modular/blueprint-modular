import { builderAI } from "@/lib/ai/builder";

export const dynamic = "force-dynamic";
/** Évite le 504 : la génération IA peut prendre 30–60s. Sur Vercel Pro, maxDuration peut être augmenté (ex. 300) dans vercel.json si besoin. */
export const maxDuration = 60;

export async function POST(req: Request) {
  const { description } = (await req.json().catch(() => ({}))) as { description?: string };
  if (!description?.trim()) {
    return new Response(JSON.stringify({ error: "description required" }), { status: 400 });
  }

  const isProduction = /production|trs|usine|ligne|fabrication/i.test(description);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "start", message: isProduction ? "Template production…" : "Connexion au modèle…" })}\n\n`
        )
      );
      try {
        if (isProduction) {
          const output = await builderAI.generateFromTemplate("production", description);
          const code = output.code ?? "";
          const lines = code.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const chunk = (i === 0 ? "" : "\n") + lines[i];
            if (chunk) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`)
              );
            }
          }
        } else {
          await builderAI.stream(
            description,
            (chunk) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`)
              );
            },
            {
              onSpec: (spec) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "spec", spec })}\n\n`)
                );
              },
            }
          );
        }
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
