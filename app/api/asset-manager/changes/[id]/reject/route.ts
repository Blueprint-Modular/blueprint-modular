import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function POST(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const change = await prisma.changeRequest.findUnique({ where: { id } });
  if (!change) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  if (change.status !== "cab_review") {
    return NextResponse.json({ error: "Seule une demande en revue CAB peut être rejetée." }, { status: 400 });
  }

  let comment: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.comment === "string" && body.comment.trim()) comment = body.comment.trim();
  } catch {
    // no body
  }

  const updated = await prisma.changeRequest.update({
    where: { id },
    data: { status: "rejected", implementationNotes: comment || change.implementationNotes },
  });
  return NextResponse.json(updated);
}
