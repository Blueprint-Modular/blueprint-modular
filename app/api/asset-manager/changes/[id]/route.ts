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
  const change = await prisma.changeRequest.findUnique({ where: { id } });
  if (!change) return NextResponse.json({ error: "Demande de changement introuvable" }, { status: 404 });
  return NextResponse.json(change);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.changeRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Demande de changement introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    type?: string;
    title?: string;
    description?: string;
    impact?: string;
    riskLevel?: string;
    rollbackPlan?: string;
    assetsImpacted?: string[] | null;
    ticketsLinked?: string[] | null;
    status?: string;
    plannedStart?: string | null;
    plannedEnd?: string | null;
    actualStart?: string | null;
    actualEnd?: string | null;
    implementationNotes?: string | null;
    success?: boolean | null;
    postImplementationReview?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.type !== undefined) data.type = body.type;
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.description !== undefined) data.description = body.description.trim();
  if (body.impact !== undefined) data.impact = body.impact.trim();
  if (body.riskLevel !== undefined) data.riskLevel = body.riskLevel;
  if (body.rollbackPlan !== undefined) data.rollbackPlan = body.rollbackPlan.trim();
  if (body.assetsImpacted !== undefined) data.assetsImpacted = body.assetsImpacted?.length ? JSON.stringify(body.assetsImpacted) : null;
  if (body.ticketsLinked !== undefined) data.ticketsLinked = body.ticketsLinked?.length ? JSON.stringify(body.ticketsLinked) : null;
  if (body.status !== undefined) data.status = body.status;
  if (body.plannedStart !== undefined) data.plannedStart = body.plannedStart ? new Date(body.plannedStart) : null;
  if (body.plannedEnd !== undefined) data.plannedEnd = body.plannedEnd ? new Date(body.plannedEnd) : null;
  if (body.actualStart !== undefined) data.actualStart = body.actualStart ? new Date(body.actualStart) : null;
  if (body.actualEnd !== undefined) data.actualEnd = body.actualEnd ? new Date(body.actualEnd) : null;
  if (body.implementationNotes !== undefined) data.implementationNotes = body.implementationNotes?.trim() || null;
  if (body.success !== undefined) data.success = body.success;
  if (body.postImplementationReview !== undefined) data.postImplementationReview = body.postImplementationReview?.trim() || null;

  const updated = await prisma.changeRequest.update({
    where: { id },
    data: data as never,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.changeRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Demande de changement introuvable" }, { status: 404 });
  await prisma.changeRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
