import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

/**
 * GET ?domainId=it
 * Retourne les tickets ouverts en danger ou dépassement SLA (≥80% du temps consommé).
 * Utilisable par un job planifié (cron) pour notifications / escalade.
 */
export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "domainId invalide" }, { status: 400 });
  }

  const config = getDomainConfig(domainId);
  const priorities = config?.priorities ?? [];
  const openStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];
  const now = Date.now();

  const tickets = await prisma.ticket.findMany({
    where: { domainId, status: { in: openStatuses } },
    select: {
      id: true,
      reference: true,
      title: true,
      status: true,
      priorityId: true,
      openedAt: true,
    },
    take: 200,
  });

  const atRisk = tickets.filter((t) => {
    const prio = priorities.find((p: { id: string; sla_hours?: number }) => p.id === t.priorityId);
    const slaHours = prio?.sla_hours ?? 48;
    const opened = new Date(t.openedAt).getTime();
    const elapsed = (now - opened) / (1000 * 60 * 60);
    const pct = (elapsed / slaHours) * 100;
    return pct >= 80;
  });

  return NextResponse.json({
    domainId,
    checkedAt: new Date().toISOString(),
    totalOpen: tickets.length,
    atRiskCount: atRisk.length,
    atRisk: atRisk.map((t) => ({
      id: t.id,
      reference: t.reference,
      title: t.title,
      status: t.status,
      priorityId: t.priorityId,
      openedAt: t.openedAt,
    })),
  });
}
