import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    message,
    provider_name = "claude",
    conversation_history = [],
    discussion_id,
  } = body as {
    message?: string;
    provider_name?: "claude" | "openai" | "gemini" | "grok";
    conversation_history?: { role: string; content: string }[];
    discussion_id?: string;
  };

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (provider_name === "claude") {
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", message: "ANTHROPIC_API_KEY not configured" })}\n\n`
              )
            );
            controller.close();
            return;
          }
          const client = new Anthropic({ apiKey });
          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [
              ...conversation_history.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
              { role: "user", content: message },
            ],
            stream: true,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              "delta" in event &&
              typeof (event as { delta?: { text?: string } }).delta?.text === "string"
            ) {
              const chunk = (event as { delta: { text: string } }).delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`)
              );
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", discussion_id: discussion_id ?? "new" })}\n\n`
            )
          );
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: `Provider ${provider_name} not implemented` })}\n\n`
            )
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`)
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
