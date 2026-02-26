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

export async function POST(
  _request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);

  const article = await prisma.wikiArticle.findFirst({
    where: { slug, OR: [{ isPublished: true }, { authorId: result.user.id }] },
    select: { id: true, viewCount: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.wikiArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });
  return NextResponse.json({ viewCount: article.viewCount + 1 });
}
