import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Liste les notifications de l'utilisateur connecté.
 * Query: read=true | read=false (optionnel) — filtre lu / non lu.
 */
export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const { searchParams } = new URL(request.url);
  const readFilter = searchParams.get("read"); // "true" | "false" | null

  const where: { userId: string; readAt?: null | { not: null } } = {
    userId: user.id,
  };
  if (readFilter === "true") where.readAt = { not: null };
  if (readFilter === "false") where.readAt = null;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      message: true,
      type: true,
      title: true,
      level: true,
      readAt: true,
      createdAt: true,
    },
  });

  const items = notifications.map((n) => ({
    id: n.id,
    message: n.message,
    type: n.type,
    title: n.title ?? null,
    level: n.level ?? 3,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  return NextResponse.json({ notifications: items });
}
