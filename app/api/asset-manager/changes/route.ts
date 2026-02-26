import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { generateChangeReference } from "@/lib/asset-manager/numbering";

export const dynamic = "force-dynamic";

const CHANGE_TYPES = ["standard", "normal", "emergency"] as const;
const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["draft", "submitted", "cab_review", "approved", "rejected", "scheduled", "in_progress", "completed", "failed", "cancelled"] as const;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const status = searchParams.get("status");

  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "domainId invalide" }, { status: 400 });
  }

  const where: { domainId: string; status?: string } = { domainId };
  if (status) where.status = status;

  const changes = await prisma.changeRequest.findMany({
    where,
    orderBy: [{ plannedStart: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  return NextResponse.json(changes);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    domainId: string;
    type?: string;
    title: string;
    description: string;
    impact: string;
    riskLevel: string;
    rollbackPlan: string;
    assetsImpacted?: string[] | null;
    ticketsLinked?: string[] | null;
  };

  if (!body.domainId?.trim()) return NextResponse.json({ error: "domainId requis" }, { status: 400 });
  if (!getDomainConfig(body.domainId)) return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
  if (!body.title?.trim()) return NextResponse.json({ error: "title requis" }, { status: 400 });
  if (!body.description?.trim()) return NextResponse.json({ error: "description requis" }, { status: 400 });
  if (!body.impact?.trim()) return NextResponse.json({ error: "impact requis" }, { status: 400 });
  if (!CHANGE_TYPES.includes(body.type as (typeof CHANGE_TYPES)[number])) return NextResponse.json({ error: "type invalide" }, { status: 400 });
  if (!RISK_LEVELS.includes(body.riskLevel as (typeof RISK_LEVELS)[number])) return NextResponse.json({ error: "riskLevel invalide" }, { status: 400 });
  if (!body.rollbackPlan?.trim()) return NextResponse.json({ error: "rollbackPlan requis" }, { status: 400 });

  const userId = result.user?.id ?? "test-user";
  const reference = await generateChangeReference(body.domainId);

  const change = await prisma.changeRequest.create({
    data: {
      domainId: body.domainId,
      reference,
      type: body.type ?? "normal",
      title: body.title.trim(),
      description: body.description.trim(),
      impact: body.impact.trim(),
      riskLevel: body.riskLevel,
      rollbackPlan: body.rollbackPlan.trim(),
      assetsImpacted: body.assetsImpacted?.length ? JSON.stringify(body.assetsImpacted) : null,
      ticketsLinked: body.ticketsLinked?.length ? JSON.stringify(body.ticketsLinked) : null,
      requesterId: userId,
      status: "draft",
    },
  });
  return NextResponse.json(change);
}
