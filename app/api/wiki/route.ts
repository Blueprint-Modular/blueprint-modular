import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { countWords, readingTimeMinutes } from "@/lib/wiki-utils";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";
  const status = searchParams.get("status")?.trim() ?? ""; // published | draft
  const search = searchParams.get("search")?.trim() ?? "";
  const tag = searchParams.get("tag")?.trim() ?? "";
  const pinnedOnly = searchParams.get("pinned") === "true";
  const parent = searchParams.get("parent")?.trim() ?? "";
  const sortBy = searchParams.get("sortBy")?.trim() || "updatedAt"; // updatedAt | createdAt | title | viewCount
  const sortOrder = searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const withContent = searchParams.get("withContent") === "true";
  const limitContent = Math.min(parseInt(searchParams.get("limit") ?? "15", 10) || 15, 30);

  const visibility =
    user && !publishedOnly
      ? { OR: [{ isPublished: true }, { authorId: user.id }] }
      : { isPublished: true };

  const statusCondition =
    status === "published"
      ? { isPublished: true }
      : status === "draft"
        ? { isPublished: false }
        : null;
  const pinnedCondition = pinnedOnly ? { pinned: true } : null;
  const parentCondition = parent !== "" ? { parentId: parent || null } : null;

  const searchCondition = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
          { tags: { hasSome: search.toLowerCase().split(/\s+/) } },
        ],
      }
    : null;

  const tagCondition = tag ? { tags: { has: tag } } : null;
  const conditions = [
    visibility,
    statusCondition,
    pinnedCondition,
    parentCondition,
    searchCondition,
    tagCondition,
  ].filter((c): c is NonNullable<typeof c> => c != null);
  const where = conditions.length > 1 ? { AND: conditions } : conditions[0] ?? visibility;

  const orderByKey =
    sortBy === "createdAt"
      ? "createdAt"
      : sortBy === "title"
        ? "title"
        : sortBy === "viewCount"
          ? "viewCount"
          : "updatedAt";
  const orderBy = [
    { pinned: "desc" as const },
    { [orderByKey]: sortOrder as "asc" | "desc" },
  ];

  const skip = withContent ? undefined : (page - 1) * PAGE_SIZE;
  const take = withContent ? limitContent : PAGE_SIZE;

  const rawArticles = await prisma.wikiArticle.findMany({
    where,
    orderBy,
    skip,
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      isPublished: true,
      excerpt: true,
      tags: true,
      pinned: true,
      wordCount: true,
      readingTimeMinutes: true,
      viewCount: true,
      lastRevisedBy: true,
      authorName: true,
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
  const {
    title,
    content,
    slug,
    parentId,
    isPublished,
    excerpt,
    tags,
    coverImage,
    pinned,
    template,
  } = body as {
    title?: string;
    content?: string;
    slug?: string;
    parentId?: string;
    isPublished?: boolean;
    excerpt?: string | null;
    tags?: string[];
    coverImage?: string | null;
    pinned?: boolean;
    template?: string | null;
  };
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }
  const normalizedSlug = normalizeSlug(slug);
  const existing = await prisma.wikiArticle.findUnique({ where: { slug: normalizedSlug } });
  if (existing) {
    return NextResponse.json({ error: "slug already exists" }, { status: 409 });
  }
  const text = content ?? "";
  const wordCount = countWords(text);
  const readingTime = text ? readingTimeMinutes(text) : 1;
  const article = await prisma.wikiArticle.create({
    data: {
      title,
      content: text,
      slug: normalizedSlug,
      parentId: parentId || null,
      authorId: user.id,
      authorName: user.name ?? null,
      isPublished: isPublished ?? false,
      excerpt: excerpt || null,
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || null,
      pinned: pinned ?? false,
      template: template || null,
      wordCount,
      readingTimeMinutes: readingTime,
      lastRevisedBy: user.name ?? null,
    },
  });
  return NextResponse.json(article);
}
