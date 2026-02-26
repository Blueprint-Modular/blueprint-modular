import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "article";
}

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const categoryId = searchParams.get("categoryId");
  const assetTypeId = searchParams.get("assetTypeId");
  const tag = searchParams.get("tag");

  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const where: { domainId: string; categoryId?: string; assetTypeId?: string | null; tags?: { has: string } } = {
    domainId,
  };
  if (categoryId) where.categoryId = categoryId;
  if (assetTypeId) where.assetTypeId = assetTypeId;
  if (tag) where.tags = { has: tag };

  const articles = await prisma.knowledgeArticle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      assetTypeId: true,
      tags: true,
      visibility: true,
      publishedAt: true,
      viewsCount: true,
      helpfulCount: true,
      notHelpfulCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as {
    domainId: string;
    title: string;
    content: string;
    categoryId: string;
    assetTypeId?: string | null;
    tags?: string[];
    visibility?: string;
  };

  if (!body.domainId?.trim()) return NextResponse.json({ error: "domainId requis" }, { status: 400 });
  if (!body.title?.trim()) return NextResponse.json({ error: "title requis" }, { status: 400 });
  if (!body.content?.trim()) return NextResponse.json({ error: "content requis" }, { status: 400 });
  if (!body.categoryId?.trim()) return NextResponse.json({ error: "categoryId requis" }, { status: 400 });

  const userId = result.user?.id ?? "test-user";
  const baseSlug = slugify(body.title);
  let slug = baseSlug;
  let n = 0;
  while (true) {
    const existing = await prisma.knowledgeArticle.findFirst({
      where: { domainId: body.domainId, slug },
    });
    if (!existing) break;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const article = await prisma.knowledgeArticle.create({
    data: {
      domainId: body.domainId,
      title: body.title.trim(),
      slug,
      content: body.content.trim(),
      categoryId: body.categoryId,
      assetTypeId: body.assetTypeId?.trim() || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      visibility: body.visibility === "public" ? "public" : "technicians_only",
      createdById: userId,
    },
  });
  return NextResponse.json(article);
}
