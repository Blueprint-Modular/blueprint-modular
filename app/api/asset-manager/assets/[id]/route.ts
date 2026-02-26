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
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      attributes: true,
      createdBy: { select: { id: true, name: true, email: true } },
      tickets: { select: { id: true, reference: true, title: true, status: true, openedAt: true } },
      assignments: { select: { id: true, reference: true, status: true, startDate: true, assignee: { select: { name: true } } } },
    },
  });
  if (!asset) return NextResponse.json({ error: "Actif introuvable" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Actif introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    label?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    statusId?: string;
    lifecycleStage?: string | null;
    locationId?: string;
    ownerUserId?: string;
    purchaseDate?: string | null;
    warrantyEndDate?: string | null;
    supplierId?: string | null;
    purchasePrice?: number | null;
    notes?: string | null;
    attributes?: { key: string; valueText?: string; valueNumber?: number; valueDate?: string; valueBool?: boolean }[];
  };

  const data: Record<string, unknown> = {};
  if (typeof body.label === "string") data.label = body.label.trim();
  if (typeof body.brand === "string") data.brand = body.brand.trim() || null;
  if (typeof body.model === "string") data.model = body.model.trim() || null;
  if (typeof body.serialNumber === "string") data.serialNumber = body.serialNumber.trim() || null;
  if (typeof body.statusId === "string") data.statusId = body.statusId;
  if (body.lifecycleStage !== undefined) data.lifecycleStage = body.lifecycleStage?.trim() || null;
  if (body.locationId !== undefined) data.locationId = body.locationId || null;
  if (body.ownerUserId !== undefined) data.ownerUserId = body.ownerUserId || null;
  if (body.purchaseDate !== undefined) data.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
  if (body.warrantyEndDate !== undefined) data.warrantyEndDate = body.warrantyEndDate ? new Date(body.warrantyEndDate) : null;
  if (body.supplierId !== undefined) data.supplierId = body.supplierId || null;
  if (body.purchasePrice !== undefined) data.purchasePrice = body.purchasePrice;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  await prisma.asset.update({ where: { id }, data: data as never });

  if (Array.isArray(body.attributes)) {
    await prisma.assetAttribute.deleteMany({ where: { assetId: id } });
    if (body.attributes.length) {
      await prisma.assetAttribute.createMany({
        data: body.attributes.map((a) => ({
          assetId: id,
          key: a.key,
          valueText: a.valueText ?? null,
          valueNumber: a.valueNumber ?? null,
          valueDate: a.valueDate ? new Date(a.valueDate) : null,
          valueBool: a.valueBool ?? null,
        })),
      });
    }
  }

  const updated = await prisma.asset.findUnique({
    where: { id },
    include: { attributes: true, createdBy: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Actif introuvable" }, { status: 404 });
  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
