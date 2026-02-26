import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const type = searchParams.get("type")?.trim(); // garantie | maintenance | leasing | credit_bail | licence

  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
  }

  const where: { domainId: string; type?: string } = { domainId };
  if (type) where.type = type;

  const contracts = await prisma.assetContract.findMany({
    where,
    orderBy: [{ endDate: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: {
    domainId: string;
    reference: string;
    type: string;
    label: string;
    supplier?: string | null;
    startDate: string;
    endDate: string;
    amount?: number | null;
    autoRenewal?: boolean;
    noticeDays?: number;
    assetIds?: string[] | null;
    notes?: string | null;
    documentUrl?: string | null;
    alertDaysBefore?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const config = getDomainConfig(body.domainId);
  if (!config) return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });

  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const validTypes = ["garantie", "maintenance", "leasing", "credit_bail", "licence"];
  if (!reference) return NextResponse.json({ error: "La référence est requise" }, { status: 400 });
  if (!validTypes.includes(type)) return NextResponse.json({ error: "Type de contrat invalide" }, { status: 400 });
  if (!label) return NextResponse.json({ error: "Le libellé est requis" }, { status: 400 });

  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;
  if (!startDate || !endDate || endDate < startDate) {
    return NextResponse.json({ error: "Dates début et fin invalides" }, { status: 400 });
  }

  const existing = await prisma.assetContract.findFirst({
    where: { domainId: body.domainId, reference },
  });
  if (existing) return NextResponse.json({ error: "Une référence de contrat existe déjà pour ce domaine" }, { status: 409 });

  const contract = await prisma.assetContract.create({
    data: {
      domainId: body.domainId,
      reference,
      type,
      label,
      supplier: body.supplier?.trim() || null,
      startDate,
      endDate,
      amount: body.amount ?? null,
      autoRenewal: body.autoRenewal ?? false,
      noticeDays: body.noticeDays ?? 30,
      assetIds: body.assetIds?.length ? JSON.stringify(body.assetIds) : null,
      notes: body.notes?.trim() || null,
      documentUrl: body.documentUrl?.trim() || null,
      alertDaysBefore: body.alertDaysBefore ?? 30,
    },
  });
  return NextResponse.json(contract);
}
