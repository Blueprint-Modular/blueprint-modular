import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const settings = await prisma.newsletterSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    const created = await prisma.newsletterSettings.create({
      data: { id: "default", headerImageUrl: null },
    });
    return NextResponse.json(created);
  }
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: { headerImageUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const settings = await prisma.newsletterSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      headerImageUrl: typeof body.headerImageUrl === "string" ? body.headerImageUrl : null,
    },
    update: {
      headerImageUrl: body.headerImageUrl !== undefined
        ? (body.headerImageUrl === null || body.headerImageUrl === "" ? null : body.headerImageUrl)
        : undefined,
    },
  });
  return NextResponse.json(settings);
}
