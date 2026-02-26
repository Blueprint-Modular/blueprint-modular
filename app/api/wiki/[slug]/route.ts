import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { countWords, readingTimeMinutes, extractWikiSlugs } from "@/lib/wiki-utils";

const MAX_REVISIONS_PER_ARTICLE = 50;

type Params = Promise<{ slug: string }> | { slug: string };

async function resolveParams(params: Params): Promise<{ slug: string }> {
  return typeof (params as Promise<{ slug: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
}

export async function GET(
  request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const { searchParams } = new URL(request.url);
  const incView = searchParams.get("incView") === "1";

  const article = await prisma.wikiArticle.findFirst({
    where: user
      ? { slug, OR: [{ isPublished: true }, { authorId: user.id }] }
      : { slug, isPublished: true },
    include: {
      author: { select: { name: true, email: true } },
      children: { select: { id: true, title: true, slug: true, excerpt: true, tags: true, pinned: true, isPublished: true } },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (incView) {
    await prisma.wikiArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  const siblings = await prisma.wikiArticle.findMany({
    where: {
      parentId: article.parentId,
      OR: user ? [{ isPublished: true }, { authorId: user.id }] : [{ isPublished: true }],
    },
    orderBy: { title: "asc" },
    select: { slug: true },
  });
  const idx = siblings.findIndex((s) => s.slug === article.slug);
  const prevSlug = idx > 0 ? siblings[idx - 1]?.slug ?? null : null;
  const nextSlug = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1]?.slug ?? null : null;

  const payload = {
    ...article,
    ...(incView ? { viewCount: article.viewCount + 1 } : {}),
    prevSlug: prevSlug ?? undefined,
    nextSlug: nextSlug ?? undefined,
  };
  return NextResponse.json(payload);
}

export async function PUT(
  request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({ where: { slug, authorId: user.id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    isPublished?: boolean;
    excerpt?: string | null;
    tags?: string[];
    coverImage?: string | null;
    pinned?: boolean;
    template?: string | null;
    changeNote?: string | null;
  };

  const content = body.content ?? article.content;
  const wordCount = countWords(content);
  const readingTime = readingTimeMinutes(content);
  const slugsInContent = extractWikiSlugs(content);

  const targetArticles = await prisma.wikiArticle.findMany({
    where: { slug: { in: slugsInContent.map((s) => normalizeSlug(s)) } },
    select: { id: true },
  });
  const targetIds = targetArticles.map((a) => a.id);

  await prisma.$transaction(async (tx) => {
    await tx.wikiRevision.create({
      data: {
        articleId: article.id,
        content: article.content,
        title: article.title,
        authorId: article.authorId,
        authorName: user.name ?? undefined,
        changeNote: body.changeNote ?? undefined,
      },
    });

    const revCount = await tx.wikiRevision.count({ where: { articleId: article.id } });
    if (revCount > MAX_REVISIONS_PER_ARTICLE) {
      const oldest = await tx.wikiRevision.findMany({
        where: { articleId: article.id },
        orderBy: { createdAt: "asc" },
        take: revCount - MAX_REVISIONS_PER_ARTICLE,
      });
      for (const r of oldest) {
        await tx.wikiRevision.delete({ where: { id: r.id } });
      }
    }

    await tx.wikiBacklink.deleteMany({ where: { sourceArticleId: article.id } });
    for (const targetId of targetIds) {
      if (targetId !== article.id) {
        await tx.wikiBacklink.upsert({
          where: {
            sourceArticleId_targetArticleId: { sourceArticleId: article.id, targetArticleId: targetId },
          },
          create: { sourceArticleId: article.id, targetArticleId: targetId },
          update: {},
        });
      }
    }

    await tx.wikiArticle.update({
      where: { id: article.id },
      data: {
        ...(body.title != null && { title: body.title }),
        ...(body.content != null && { content: body.content }),
        ...(body.isPublished != null && { isPublished: body.isPublished }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt || null }),
        ...(body.tags !== undefined && { tags: body.tags ?? [] }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage || null }),
        ...(body.pinned !== undefined && { pinned: body.pinned }),
        ...(body.template !== undefined && { template: body.template || null }),
        wordCount,
        readingTimeMinutes: readingTime,
        lastRevisedBy: user.name ?? null,
        authorName: user.name ?? undefined,
      },
    });
  });

  const updated = await prisma.wikiArticle.findUniqueOrThrow({
    where: { id: article.id },
    include: {
      author: { select: { name: true, email: true } },
      children: { select: { id: true, title: true, slug: true, excerpt: true, tags: true, pinned: true, isPublished: true } },
    },
  });
  return NextResponse.json(updated);
}

export async function PATCH(
  request: Request,
  context: { params: Params }
) {
  return PUT(request, context);
}

export async function DELETE(
  _request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canDelete = article.authorId === user.id || user.role === "ADMIN" || user.role === "OWNER";
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.wikiArticle.delete({ where: { id: article.id } });
  return new NextResponse(null, { status: 204 });
}
