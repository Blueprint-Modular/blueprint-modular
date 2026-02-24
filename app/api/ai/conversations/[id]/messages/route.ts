import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conv.messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await request.json()) as { message: string };
  const userMessage = body.message?.trim() ?? "";
  if (!userMessage) return NextResponse.json({ error: "message required" }, { status: 400 });

  const aiResponse =
    "Réponse IA (module en cours de configuration). Ajoutez une clé API dans Paramètres pour activer les réponses réelles.";
  const preview = userMessage.slice(0, 80) + (userMessage.length > 80 ? "…" : "");

  const [msg] = await prisma.$transaction([
    prisma.aiMessage.create({
      data: {
        conversationId: conv.id,
        userMessage,
        aiResponse,
        providerName: "placeholder",
      },
    }),
    prisma.aiConversation.update({
      where: { id: conv.id },
      data: { preview, updatedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ userMessage, aiResponse, messageId: msg.id });
}
