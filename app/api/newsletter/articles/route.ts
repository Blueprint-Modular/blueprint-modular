import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived"); // "true" | "false" | omit = all
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const sortOrder = searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";

  const where: { authorId: string; archived?: boolean } = { authorId: result.user.id };
  if (archived === "true") where.archived = true;
  else if (archived === "false") where.archived = false;

  const orderByKey = sortBy === "publishedAt" ? "publishedAt" : sortBy === "createdAt" ? "createdAt" : "updatedAt";
  const articles = await prisma.newsletterArticle.findMany({
    where,
    orderBy: { [orderByKey]: sortOrder },
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: { title: string; content: string; excerpt?: string | null; publishedAt?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  if (!title) return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });

  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() || null : null;

  const article = await prisma.newsletterArticle.create({
    data: {
      title,
      content,
      excerpt,
      publishedAt,
      authorId: result.user.id,
    },
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json(article);
}
