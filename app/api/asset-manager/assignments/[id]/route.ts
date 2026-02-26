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
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true } },
      ticket: { select: { id: true, reference: true, title: true } },
    },
  });
  if (!assignment) return NextResponse.json({ error: "Mise à disposition introuvable" }, { status: 404 });
  return NextResponse.json(assignment);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) return NextResponse.json({ error: "Mise à disposition introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    assignmentType?: string;
    expectedEndDate?: string | null;
    actualEndDate?: string | null;
    status?: string;
    reason?: string | null;
    conditionAtStart?: string | null;
    conditionAtReturn?: string | null;
    contractSigned?: boolean;
    notes?: string | null;
    ticketId?: string | null;
    technicianId?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (typeof body.assignmentType === "string") data.assignmentType = body.assignmentType;
  if (body.expectedEndDate !== undefined) data.expectedEndDate = body.expectedEndDate ? new Date(body.expectedEndDate) : null;
  if (body.actualEndDate !== undefined) data.actualEndDate = body.actualEndDate ? new Date(body.actualEndDate) : null;
  if (typeof body.status === "string") data.status = body.status;
  if (body.reason !== undefined) data.reason = body.reason?.trim() || null;
  if (body.conditionAtStart !== undefined) data.conditionAtStart = body.conditionAtStart?.trim() || null;
  if (body.conditionAtReturn !== undefined) data.conditionAtReturn = body.conditionAtReturn?.trim() || null;
  if (typeof body.contractSigned === "boolean") data.contractSigned = body.contractSigned;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.ticketId !== undefined) data.ticketId = body.ticketId || null;
  if (body.technicianId !== undefined) data.technicianId = body.technicianId || null;

  const updated = await prisma.assignment.update({
    where: { id },
    data: data as never,
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true } },
      ticket: { select: { id: true, reference: true, title: true } },
    },
  });
  return NextResponse.json(updated);
}
