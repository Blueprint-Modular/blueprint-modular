import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Recherche sémantique : body { query, limit }.
 * Si pgvector/embedding non disponible : fallback sur recherche full-text ?search= sur les articles publiés.
 */
export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const body = (await request.json()) as { query?: string; limit?: number };
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const limit = Math.min(Math.max(1, parseInt(String(body.limit), 10) || 5), 20);

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const visibility = user
    ? { OR: [{ isPublished: true }, { authorId: user.id }] }
    : { isPublished: true };

  // Fallback full-text : pas de pgvector dans ce projet par défaut
  const articles = await prisma.wikiArticle.findMany({
    where: {
      ...visibility,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: query.toLowerCase().split(/\s+/) } },
      ],
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      updatedAt: true,
      authorName: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json({
    results: articles,
    fallback: "fulltext",
    message: "Recherche full-text (pgvector non configuré).",
  });
}
