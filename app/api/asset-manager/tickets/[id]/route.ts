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
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    status?: string;
    priorityId?: string;
    categoryId?: string;
    subcategory?: string | null;
    assetId?: string | null;
    assigneeId?: string | null;
    solution?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.priorityId === "string") data.priorityId = body.priorityId;
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId;
  if (body.subcategory !== undefined) data.subcategory = body.subcategory?.trim() || null;
  if (body.assetId !== undefined) data.assetId = body.assetId || null;
  if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId || null;
  if (body.solution !== undefined) data.solution = body.solution?.trim() || null;

  if (body.status === "resolved" || body.status === "closed") {
    if (!ticket.takenAt) data.takenAt = new Date();
    if (body.status === "resolved" && !ticket.resolvedAt) data.resolvedAt = new Date();
    if (body.status === "closed") data.closedAt = new Date();
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: data as never,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(updated);
}
