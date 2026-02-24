import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { vllmClient } from "@/lib/ai/vllm-client";
import { SYSTEM_PROMPT_WITH_CONTEXT } from "@/lib/ai/prompt-templates";

export const dynamic = "force-dynamic";

async function saveConversationTurn(
  userId: string,
  discussionId: string | undefined,
  userMessage: string,
  aiResponse: string,
  providerName: string
): Promise<string> {
  const preview = userMessage.slice(0, 80) + (userMessage.length > 80 ? "…" : "");
  if (discussionId) {
    const conv = await prisma.aiConversation.findFirst({ where: { id: discussionId, userId } });
    if (conv) {
      await prisma.$transaction([
        prisma.aiMessage.create({
          data: { conversationId: conv.id, userMessage, aiResponse, providerName },
        }),
        prisma.aiConversation.update({ where: { id: conv.id }, data: { preview, updatedAt: new Date() } }),
      ]);
      return conv.id;
    }
  }
  const conv = await prisma.aiConversation.create({
    data: { userId, preview },
  });
  await prisma.aiMessage.create({
    data: { conversationId: conv.id, userMessage, aiResponse, providerName },
  });
  return conv.id;
}

export async function POST(req: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return new Response("Unauthorized", { status: 401 });
  const { user } = result;

  const body = await req.json().catch(() => ({}));
  const {
    message,
    provider_name = "vllm",
    conversation_history = [],
    discussion_id,
    context_from_modules,
  } = body as {
    message?: string;
    provider_name?: "claude" | "openai" | "gemini" | "grok" | "vllm" | "qwen" | "mistral";
    conversation_history?: { role: string; content: string }[];
    discussion_id?: string;
    context_from_modules?: string;
  };

  const ollamaProvider = provider_name === "vllm" || provider_name === "qwen" || provider_name === "mistral";
  const ollamaModel =
    provider_name === "qwen"
      ? process.env.AI_MODEL_QWEN ?? "qwen2.5:7b"
      : provider_name === "mistral"
        ? process.env.AI_MODEL_MISTRAL ?? "mistral:7b"
        : undefined;

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
  }

  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (ollamaProvider) {
          const systemContent = context_from_modules
            ? SYSTEM_PROMPT_WITH_CONTEXT(context_from_modules)
            : undefined;
          const messages = [
            ...(systemContent ? [{ role: "system" as const, content: systemContent }] : []),
            ...conversation_history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
            { role: "user" as const, content: message },
          ];
          try {
            await vllmClient.chatStream(messages, (chunk) => {
              fullResponse += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`));
            }, ollamaModel ? { model: ollamaModel } : {});
            const savedId = await saveConversationTurn(user.id, discussion_id, message, fullResponse, provider_name);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done", discussion_id: savedId })}\n\n`)
            );
          } catch (vllmErr) {
            const errMsg = vllmErr instanceof Error ? vllmErr.message : "vLLM error";
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`));
          }
          controller.close();
          return;
        }
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
              fullResponse += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`)
              );
            }
          }
          const savedId = await saveConversationTurn(user.id, discussion_id, message, fullResponse, provider_name);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", discussion_id: savedId })}\n\n`)
          );
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: `Provider ${provider_name} not implemented` })}\n\n`
            )
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
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
