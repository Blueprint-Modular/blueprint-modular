import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function POST(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { asset: true },
  });
  if (!assignment) return NextResponse.json({ error: "Mise à disposition introuvable" }, { status: 404 });
  if (assignment.status !== "active") {
    return NextResponse.json({ error: "Seule une MAD en cours peut être restituée." }, { status: 400 });
  }

  const config = getDomainConfig(assignment.domainId);
  const inStockStatusId = config?.statuses?.find((s) => s.id === "in_stock")?.id ?? "in_stock";
  const now = new Date();

  await prisma.$transaction([
    prisma.assignment.update({
      where: { id },
      data: { status: "returned", actualEndDate: now },
    }),
    ...(assignment.assetId
      ? [
          prisma.asset.update({
            where: { id: assignment.assetId },
            data: { statusId: inStockStatusId },
          }),
        ]
      : []),
  ]);

  const updated = await prisma.assignment.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true } },
      ticket: { select: { id: true, reference: true, title: true } },
    },
  });
  return NextResponse.json(updated);
}
