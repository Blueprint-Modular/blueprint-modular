import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";
  const search = searchParams.get("search")?.trim() ?? "";

  const user = await prisma.user.findUnique({ where: { email: session.user?.email ?? "" } });

  const visibility =
    user && !publishedOnly
      ? { OR: [{ isPublished: true }, { authorId: user.id }] }
      : { isPublished: true };

  const searchCondition = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : null;

  const where = searchCondition ? { AND: [visibility, searchCondition] } : visibility;

  const articles = await prisma.wikiArticle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      updatedAt: true,
      isPublished: true,
      author: { select: { name: true } },
    },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const body = await request.json();
  const { title, content, slug, parentId, isPublished } = body as {
    title?: string;
    content?: string;
    slug?: string;
    parentId?: string;
    isPublished?: boolean;
  };
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }
  const normalizedSlug = slug.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const existing = await prisma.wikiArticle.findUnique({ where: { slug: normalizedSlug } });
  if (existing) {
    return NextResponse.json({ error: "slug already exists" }, { status: 409 });
  }
  const article = await prisma.wikiArticle.create({
    data: {
      title,
      content: content ?? "",
      slug: normalizedSlug,
      parentId: parentId || null,
      authorId: user.id,
      isPublished: isPublished ?? false,
    },
  });
  return NextResponse.json(article);
}
