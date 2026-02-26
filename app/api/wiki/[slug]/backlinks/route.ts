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
  if (!article.isPublished && (!user || (user.id !== article.authorId && user.role !== "ADMIN" && user.role !== "OWNER"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const backlinks = await prisma.wikiBacklink.findMany({
    where: { targetArticleId: article.id },
    include: {
      source: { select: { id: true, title: true, slug: true, excerpt: true } },
    },
  });
  const list = backlinks.map((b) => ({
    id: b.source.id,
    title: b.source.title,
    slug: b.source.slug,
    excerpt: b.source.excerpt ?? undefined,
  }));
  return NextResponse.json(list);
}
