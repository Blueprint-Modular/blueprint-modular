import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";

type Params = Promise<{ slug: string }> | { slug: string };

async function resolveParams(params: Params): Promise<{ slug: string }> {
  return typeof (params as Promise<{ slug: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
}

export async function GET(
  _request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({
    where: { slug },
    select: { id: true, authorId: true, isPublished: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (article.isPublished) {
    // Lecture publique des commentaires pour articles publiés.
  } else if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    const canSee = user.id === article.authorId || user.role === "ADMIN" || user.role === "OWNER";
    if (!canSee) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await prisma.wikiComment.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      authorId: true,
      authorName: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({
    where: { slug },
    select: { id: true, authorId: true, isPublished: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canSee = user.id === article.authorId || user.role === "ADMIN" || user.role === "OWNER" || article.isPublished;
  if (!canSee) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { content?: string };
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const comment = await prisma.wikiComment.create({
    data: {
      articleId: article.id,
      content,
      authorId: user.id,
      authorName: user.name ?? undefined,
    },
  });
  return NextResponse.json(comment);
}
