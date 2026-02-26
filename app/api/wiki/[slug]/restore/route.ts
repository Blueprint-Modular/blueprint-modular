import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { countWords, readingTimeMinutes } from "@/lib/wiki-utils";

type Params = Promise<{ slug: string }> | { slug: string };

async function resolveParams(params: Params): Promise<{ slug: string }> {
  return typeof (params as Promise<{ slug: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
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
  const body = (await request.json()) as { revisionId?: string };
  const revisionId = body.revisionId?.trim();
  if (!revisionId) return NextResponse.json({ error: "revisionId required" }, { status: 400 });

  const article = await prisma.wikiArticle.findFirst({
    where: { slug, authorId: user.id },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const revision = await prisma.wikiRevision.findFirst({
    where: { id: revisionId, articleId: article.id },
    select: { content: true },
  });
  if (!revision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });

  const wordCount = countWords(revision.content);
  const readingTime = readingTimeMinutes(revision.content);

  await prisma.wikiArticle.update({
    where: { id: article.id },
    data: {
      content: revision.content,
      wordCount,
      readingTimeMinutes: readingTime,
      lastRevisedBy: user.name ?? null,
    },
  });

  const updated = await prisma.wikiArticle.findUniqueOrThrow({
    where: { id: article.id },
    include: {
      author: { select: { name: true, email: true } },
      children: { select: { id: true, title: true, slug: true, excerpt: true, tags: true, pinned: true } },
    },
  });
  return NextResponse.json(updated);
}
