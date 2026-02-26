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

export async function GET(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const relation = await prisma.cIRelation.findUnique({
    where: { id },
    include: {
      sourceAsset: { select: { id: true, reference: true, label: true } },
      targetAsset: { select: { id: true, reference: true, label: true } },
    },
  });
  if (!relation) return NextResponse.json({ error: "Relation introuvable" }, { status: 404 });
  return NextResponse.json(relation);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.cIRelation.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Relation introuvable" }, { status: 404 });
  await prisma.cIRelation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
