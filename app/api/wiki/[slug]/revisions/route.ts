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
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({
    where: { slug },
    select: { id: true, authorId: true, isPublished: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (article.isPublished) {
    // Lecture publique des révisions pour articles publiés (CDC Phase 3).
  } else if (!result) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    const canSee =
      result.user.id === article.authorId ||
      result.user.role === "ADMIN" ||
      result.user.role === "OWNER";
    if (!canSee) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const revisions = await prisma.wikiRevision.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      title: true,
      authorId: true,
      authorName: true,
      changeNote: true,
      createdAt: true,
    },
  });
  return NextResponse.json(revisions);
}
