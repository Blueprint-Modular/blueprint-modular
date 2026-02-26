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
  const contract = await prisma.assetContract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const contract = await prisma.assetContract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    reference?: string;
    type?: string;
    label?: string;
    supplier?: string | null;
    startDate?: string;
    endDate?: string;
    amount?: number | null;
    autoRenewal?: boolean;
    noticeDays?: number;
    assetIds?: string[] | null;
    notes?: string | null;
    documentUrl?: string | null;
    alertDaysBefore?: number;
  };

  const data: Record<string, unknown> = {};
  if (body.reference !== undefined) data.reference = body.reference?.trim() ?? contract.reference;
  if (body.type !== undefined) data.type = body.type?.trim() ?? contract.type;
  if (body.label !== undefined) data.label = body.label?.trim() ?? contract.label;
  if (body.supplier !== undefined) data.supplier = body.supplier?.trim() || null;
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : contract.startDate;
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : contract.endDate;
  if (body.amount !== undefined) data.amount = body.amount;
  if (body.autoRenewal !== undefined) data.autoRenewal = body.autoRenewal;
  if (body.noticeDays !== undefined) data.noticeDays = body.noticeDays;
  if (body.assetIds !== undefined) data.assetIds = body.assetIds ? JSON.stringify(body.assetIds) : contract.assetIds;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.documentUrl !== undefined) data.documentUrl = body.documentUrl?.trim() || null;
  if (body.alertDaysBefore !== undefined) data.alertDaysBefore = body.alertDaysBefore;

  const updated = await prisma.assetContract.update({ where: { id }, data: data as never });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const contract = await prisma.assetContract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  await prisma.assetContract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
