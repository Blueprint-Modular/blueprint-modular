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
  const movement = await prisma.assetMovement.findUnique({
    where: { id },
    include: { asset: { select: { id: true, reference: true, label: true } } },
  });
  if (!movement) return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });
  return NextResponse.json(movement);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.assetMovement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    movementType?: string;
    date?: string;
    fromLocationId?: string | null;
    toLocationId?: string | null;
    reason?: string | null;
    notes?: string | null;
    ticketId?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.movementType !== undefined) data.movementType = body.movementType;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.fromLocationId !== undefined) data.fromLocationId = body.fromLocationId?.trim() || null;
  if (body.toLocationId !== undefined) data.toLocationId = body.toLocationId?.trim() || null;
  if (body.reason !== undefined) data.reason = body.reason?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.ticketId !== undefined) data.ticketId = body.ticketId || null;

  const updated = await prisma.assetMovement.update({
    where: { id },
    data: data as never,
    include: { asset: { select: { id: true, reference: true, label: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.assetMovement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });
  await prisma.assetMovement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
