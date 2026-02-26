import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const assetTypeId = searchParams.get("assetTypeId");
  const statusId = searchParams.get("statusId");
  const lifecycleStageParam = searchParams.get("lifecycleStage");
  const search = searchParams.get("search")?.trim();

  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
  }

  const where: Prisma.AssetWhereInput = { domainId };
  if (assetTypeId) where.assetTypeId = assetTypeId;
  if (statusId) where.statusId = statusId;
  if (lifecycleStageParam !== null && lifecycleStageParam !== undefined)
    where.lifecycleStage = lifecycleStageParam.trim() || null;
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { label: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      attributes: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: {
    domainId: string;
    assetTypeId: string;
    label: string;
    reference?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    statusId: string;
    locationId?: string;
    ownerUserId?: string;
    purchaseDate?: string;
    warrantyEndDate?: string;
    supplierId?: string;
    purchasePrice?: number;
    notes?: string;
    attributes?: { key: string; valueText?: string; valueNumber?: number; valueDate?: string; valueBool?: boolean }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const config = getDomainConfig(body.domainId);
  if (!config) return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });

  const label = typeof body.label === "string" ? body.label.trim() : "";
  const statusId = typeof body.statusId === "string" ? body.statusId : config.statuses[0]?.id ?? "in_service";
  if (!label) return NextResponse.json({ error: "Le libellé est requis" }, { status: 400 });

  // Référence : pour l'instant génération simple (PREFIX-TYPE-ANNEE-SEQ)
  const year = new Date().getFullYear();
  const count = await prisma.asset.count({
    where: { domainId: body.domainId, assetTypeId: body.assetTypeId },
  });
  const seq = String(count + 1).padStart(4, "0");
  const prefix = config.asset_id_prefix ?? "AST";
  const reference = body.reference?.trim() || `${prefix}-${body.assetTypeId}-${year}-${seq}`;

  const existingRef = await prisma.asset.findUnique({ where: { reference } });
  if (existingRef) return NextResponse.json({ error: "Cette référence existe déjà" }, { status: 409 });

  const asset = await prisma.asset.create({
    data: {
      domainId: body.domainId,
      assetTypeId: body.assetTypeId,
      reference,
      label,
      brand: body.brand?.trim() || null,
      model: body.model?.trim() || null,
      serialNumber: body.serialNumber?.trim() || null,
      statusId,
      locationId: body.locationId || null,
      ownerUserId: body.ownerUserId || null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      warrantyEndDate: body.warrantyEndDate ? new Date(body.warrantyEndDate) : null,
      supplierId: body.supplierId || null,
      purchasePrice: body.purchasePrice ?? null,
      notes: body.notes?.trim() || null,
      createdById: result.user.id,
    },
    include: {
      attributes: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (body.attributes?.length) {
    await prisma.assetAttribute.createMany({
      data: body.attributes.map((a) => ({
        assetId: asset.id,
        key: a.key,
        valueText: a.valueText ?? null,
        valueNumber: a.valueNumber ?? null,
        valueDate: a.valueDate ? new Date(a.valueDate) : null,
        valueBool: a.valueBool ?? null,
      })),
    });
    const withAttrs = await prisma.asset.findUnique({
      where: { id: asset.id },
      include: { attributes: true, createdBy: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(withAttrs ?? asset);
  }
  return NextResponse.json(asset);
}
