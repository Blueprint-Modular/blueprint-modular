import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
