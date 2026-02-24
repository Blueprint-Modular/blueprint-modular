import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";
  const search = searchParams.get("search")?.trim() ?? "";
  const withContent = searchParams.get("withContent") === "true";
  const limitContent = Math.min(parseInt(searchParams.get("limit") ?? "15", 10) || 15, 30);

  const visibility =
    user && !publishedOnly
      ? { OR: [{ isPublished: true }, { authorId: user.id }] }
      : { isPublished: true };

  const searchCondition = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : null;

  const where = searchCondition ? { AND: [visibility, searchCondition] } : visibility;

  const rawArticles = await prisma.wikiArticle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: withContent ? limitContent : undefined,
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      authorId: true,
      updatedAt: true,
      isPublished: true,
      author: { select: { name: true } },
      ...(withContent ? { content: true } : {}),
    },
  });

  const canEdit = (authorId: string) =>
    !!user && (user.id === authorId || user.role === "ADMIN" || user.role === "OWNER");
  const articles = rawArticles.map((a) => ({ ...a, canEdit: canEdit(a.authorId) }));
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const body = await request.json();
  const { title, content, slug, parentId, isPublished } = body as {
    title?: string;
    content?: string;
    slug?: string;
    parentId?: string;
    isPublished?: boolean;
  };
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }
  const normalizedSlug = slug.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const existing = await prisma.wikiArticle.findUnique({ where: { slug: normalizedSlug } });
  if (existing) {
    return NextResponse.json({ error: "slug already exists" }, { status: 409 });
  }
  const article = await prisma.wikiArticle.create({
    data: {
      title,
      content: content ?? "",
      slug: normalizedSlug,
      parentId: parentId || null,
      authorId: user.id,
      isPublished: isPublished ?? false,
    },
  });
  return NextResponse.json(article);
}
