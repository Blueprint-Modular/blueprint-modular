import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;

  const articles = await prisma.wikiArticle.findMany({
    where: user
      ? { OR: [{ isPublished: true }, { authorId: user.id }] }
      : { isPublished: true },
    select: { tags: true },
  });

  const countByTag = new Map<string, number>();
  for (const a of articles) {
    for (const tag of a.tags) {
      countByTag.set(tag, (countByTag.get(tag) ?? 0) + 1);
    }
  }
  const list = Array.from(countByTag.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
  return NextResponse.json(list);
}
