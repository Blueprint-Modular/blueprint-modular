import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RELATION_TYPES = ["depends_on", "connected_to", "hosted_on", "fed_by", "controls"] as const;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const sourceAssetId = searchParams.get("sourceAssetId");
  const targetAssetId = searchParams.get("targetAssetId");
  const assetId = searchParams.get("assetId"); // relations où cet actif est source OU cible

  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  type WhereInput = { domainId: string; sourceAssetId?: string; targetAssetId?: string; OR?: Array<{ sourceAssetId: string } | { targetAssetId: string }> };
  let where: WhereInput = { domainId };
  if (assetId) {
    where = { domainId, OR: [{ sourceAssetId: assetId }, { targetAssetId: assetId }] };
  } else if (sourceAssetId) {
    where.sourceAssetId = sourceAssetId;
  } else if (targetAssetId) {
    where.targetAssetId = targetAssetId;
  }

  const relations = await prisma.cIRelation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      sourceAsset: { select: { id: true, reference: true, label: true } },
      targetAsset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(relations);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    domainId: string;
    sourceAssetId: string;
    targetAssetId: string;
    relationType: string;
    description?: string | null;
  };

  if (!body.domainId?.trim()) return NextResponse.json({ error: "domainId requis" }, { status: 400 });
  if (!body.sourceAssetId?.trim()) return NextResponse.json({ error: "sourceAssetId requis" }, { status: 400 });
  if (!body.targetAssetId?.trim()) return NextResponse.json({ error: "targetAssetId requis" }, { status: 400 });
  if (!RELATION_TYPES.includes(body.relationType as (typeof RELATION_TYPES)[number])) {
    return NextResponse.json({ error: "relationType invalide" }, { status: 400 });
  }
  if (body.sourceAssetId === body.targetAssetId) {
    return NextResponse.json({ error: "Source et cible doivent être différents" }, { status: 400 });
  }

  const [source, target] = await Promise.all([
    prisma.asset.findUnique({ where: { id: body.sourceAssetId }, select: { id: true, domainId: true } }),
    prisma.asset.findUnique({ where: { id: body.targetAssetId }, select: { id: true, domainId: true } }),
  ]);
  if (!source || !target) return NextResponse.json({ error: "Actif source ou cible introuvable" }, { status: 404 });
  if (source.domainId !== body.domainId || target.domainId !== body.domainId) {
    return NextResponse.json({ error: "Les deux actifs doivent appartenir au même domaine" }, { status: 400 });
  }

  const userId = result.user?.id ?? "test-user";
  const relation = await prisma.cIRelation.create({
    data: {
      domainId: body.domainId,
      sourceAssetId: body.sourceAssetId,
      targetAssetId: body.targetAssetId,
      relationType: body.relationType,
      description: body.description?.trim() || null,
      createdById: userId,
    },
    include: {
      sourceAsset: { select: { id: true, reference: true, label: true } },
      targetAsset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(relation);
}
