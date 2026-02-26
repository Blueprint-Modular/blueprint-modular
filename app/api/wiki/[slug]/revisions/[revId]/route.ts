import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";

type Params = Promise<{ slug: string; revId: string }> | { slug: string; revId: string };

async function resolveParams(params: Params): Promise<{ slug: string; revId: string }> {
  const p = typeof (params as Promise<{ slug: string; revId: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string; revId: string }>)
    : (params as { slug: string; revId: string });
  return p;
}

export async function GET(
  _request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug: rawSlug, revId } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({
    where: { slug },
    select: { id: true, authorId: true, isPublished: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canSee =
    result.user.id === article.authorId ||
    result.user.role === "ADMIN" ||
    result.user.role === "OWNER" ||
    article.isPublished;
  if (!canSee) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const revision = await prisma.wikiRevision.findFirst({
    where: { id: revId, articleId: article.id },
    select: { id: true, content: true, authorName: true, changeNote: true, createdAt: true },
  });
  if (!revision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });
  return NextResponse.json(revision);
}
