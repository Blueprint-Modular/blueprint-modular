import { getSessionOrTestUser } from "@/lib/auth";
import { vllmClient } from "@/lib/ai/vllm-client";
import { TEMPLATE_WIKI_GENERATION, TEMPLATE_WIKI_FORMAT } from "@/lib/ai/prompt-templates";

export const dynamic = "force-dynamic";

const ARTICLE_TYPES = ["guide", "procedure", "best-practice", "reference"] as const;
const WORKSPACES = ["nxtfood", "beam", "shared"] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number];
type Workspace = (typeof WORKSPACES)[number];

function isArticleType(s: string): s is ArticleType {
  return ARTICLE_TYPES.includes(s as ArticleType);
}
function isWorkspace(s: string): s is Workspace {
  return WORKSPACES.includes(s as Workspace);
}

export async function POST(req: Request) {
  const result = await getSessionOrTestUser();
  if (!result) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { notes, articleType, workspace, action, content, title } = body as {
    notes?: string;
    articleType?: string;
    workspace?: string;
    action?: string;
    content?: string;
    title?: string;
  };

  const isFormat = action === "format";
  let prompt: string;

  if (isFormat) {
    const text = typeof content === "string" ? content.trim() : "";
    if (!text) {
      return new Response(JSON.stringify({ error: "content requis pour l'action format" }), { status: 400 });
    }
    prompt = TEMPLATE_WIKI_FORMAT({ content: text, title: typeof title === "string" ? title.trim() : undefined });
  } else {
    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return new Response(JSON.stringify({ error: "notes requis et non vide" }), { status: 400 });
    }
    if (!articleType || !isArticleType(articleType)) {
      return new Response(
        JSON.stringify({ error: "articleType invalide (guide, procedure, best-practice, reference)" }),
        { status: 400 }
      );
    }
    if (!workspace || !isWorkspace(workspace)) {
      return new Response(
        JSON.stringify({ error: "workspace invalide (nxtfood, beam, shared)" }),
        { status: 400 }
      );
    }
    prompt = TEMPLATE_WIKI_GENERATION({
      notes: notes.trim(),
      articleType,
      workspace,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await vllmClient.chatStream(
          [{ role: "user", content: prompt }],
          (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`));
          }
        );
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Le serveur IA est temporairement indisponible. Réessayez dans quelques instants.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`));
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
