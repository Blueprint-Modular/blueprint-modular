import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MOVEMENT_TYPES = ["reception", "deployment", "transfer", "return", "repair_out", "repair_in", "disposal"] as const;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");
  const domainId = searchParams.get("domainId");

  if (assetId) {
    const movements = await prisma.assetMovement.findMany({
      where: { assetId },
      orderBy: { date: "desc" },
      take: 100,
    });
    return NextResponse.json(movements);
  }

  if (domainId) {
    const movements = await prisma.assetMovement.findMany({
      where: { asset: { domainId } },
      orderBy: { date: "desc" },
      take: 200,
      include: { asset: { select: { id: true, reference: true, label: true } } },
    });
    return NextResponse.json(movements);
  }

  return NextResponse.json({ error: "assetId ou domainId requis" }, { status: 400 });
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    assetId: string;
    movementType: string;
    date: string;
    fromLocationId?: string | null;
    toLocationId?: string | null;
    fromUserId?: string | null;
    toUserId?: string | null;
    reason?: string | null;
    ticketId?: string | null;
    notes?: string | null;
  };

  if (!body.assetId?.trim()) return NextResponse.json({ error: "assetId requis" }, { status: 400 });
  if (!MOVEMENT_TYPES.includes(body.movementType as (typeof MOVEMENT_TYPES)[number])) {
    return NextResponse.json({ error: "movementType invalide" }, { status: 400 });
  }
  if (!body.date) return NextResponse.json({ error: "date requise" }, { status: 400 });

  const asset = await prisma.asset.findUnique({ where: { id: body.assetId } });
  if (!asset) return NextResponse.json({ error: "Actif introuvable" }, { status: 404 });

  const userId = result.user?.id ?? "test-user";
  const movement = await prisma.assetMovement.create({
    data: {
      assetId: body.assetId,
      movementType: body.movementType,
      date: new Date(body.date),
      fromLocationId: body.fromLocationId?.trim() || null,
      toLocationId: body.toLocationId?.trim() || null,
      fromUserId: body.fromUserId?.trim() || null,
      toUserId: body.toUserId?.trim() || null,
      performedById: userId,
      reason: body.reason?.trim() || null,
      ticketId: body.ticketId || null,
      notes: body.notes?.trim() || null,
    },
  });
  return NextResponse.json(movement);
}
