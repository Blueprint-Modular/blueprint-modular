import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketReference } from "@/lib/asset-manager/numbering";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId") ?? "";
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const tickets = await prisma.ticket.findMany({
    where: { domainId },
    orderBy: [{ openedAt: "desc" }],
    take: 200,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    domainId: string;
    typeId?: string;
    title: string;
    description: string;
    priorityId: string;
    categoryId: string;
    subcategory?: string | null;
    assetId?: string | null;
  };

  const domainId = body.domainId?.trim();
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });
  const config = getDomainConfig(domainId);
  if (!config) return NextResponse.json({ error: "Domaine inconnu" }, { status: 400 });

  const typeId = body.typeId ?? (config.ticket_types?.[0] ?? "Incident");
  const title = body.title?.trim();
  const description = body.description?.trim();
  const priorityId = body.priorityId ?? config.priorities?.[0]?.id ?? "normal";
  const categoryId = body.categoryId ?? config.ticket_categories?.[0]?.id ?? "other";
  if (!title) return NextResponse.json({ error: "title requis" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "description requis" }, { status: 400 });

  const prefix = config.numbering?.ticket?.split("-")[0] ?? "TK";
  const reference = await generateTicketReference(domainId, prefix);

  const ticket = await prisma.ticket.create({
    data: {
      domainId,
      reference,
      typeId,
      title,
      description,
      status: "new",
      priorityId,
      categoryId,
      subcategory: body.subcategory?.trim() || null,
      assetId: body.assetId || null,
      requesterId: result.user.id,
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(ticket);
}
