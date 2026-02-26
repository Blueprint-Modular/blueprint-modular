import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAssignmentReference } from "@/lib/asset-manager/numbering";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId") ?? "";
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const assignments = await prisma.assignment.findMany({
    where: { domainId },
    orderBy: [{ startDate: "desc" }],
    take: 200,
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    domainId: string;
    assetId: string;
    assigneeId: string;
    assignmentType?: string;
    startDate: string;
    expectedEndDate?: string | null;
    reason?: string | null;
    technicianId?: string | null;
    ticketId?: string | null;
  };

  const domainId = body.domainId?.trim();
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });
  const config = getDomainConfig(domainId);
  if (!config) return NextResponse.json({ error: "Domaine inconnu" }, { status: 400 });
  if (!body.assetId) return NextResponse.json({ error: "assetId requis" }, { status: 400 });
  if (!body.assigneeId) return NextResponse.json({ error: "assigneeId requis" }, { status: 400 });
  if (!body.startDate) return NextResponse.json({ error: "startDate requis" }, { status: 400 });

  const prefix = config.numbering?.assignment?.split("-")[0] ?? "MAD";
  const reference = await generateAssignmentReference(domainId, prefix);

  const assignment = await prisma.assignment.create({
    data: {
      domainId,
      reference,
      assignmentType: body.assignmentType ?? "temporary",
      assetId: body.assetId,
      assigneeId: body.assigneeId,
      startDate: new Date(body.startDate),
      expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : null,
      status: "active",
      reason: body.reason?.trim() || null,
      technicianId: body.technicianId || null,
      ticketId: body.ticketId || null,
    },
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
      ticket: { select: { id: true, reference: true, title: true } },
    },
  });
  return NextResponse.json(assignment);
}