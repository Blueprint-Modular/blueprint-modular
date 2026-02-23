import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user?.email ?? "" } });
  const article = await prisma.wikiArticle.findFirst({
    where: user
      ? { slug, OR: [{ isPublished: true }, { authorId: user.id }] }
      : { slug, isPublished: true },
    include: {
      author: { select: { name: true, email: true } },
      children: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { slug } = await params;
  const article = await prisma.wikiArticle.findFirst({ where: { slug, authorId: user.id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await request.json()) as { title?: string; content?: string; isPublished?: boolean };
  const updated = await prisma.wikiArticle.update({
    where: { id: article.id },
    data: {
      ...(body.title != null && { title: body.title }),
      ...(body.content != null && { content: body.content }),
      ...(body.isPublished != null && { isPublished: body.isPublished }),
    },
  });
  return NextResponse.json(updated);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { slug } = await params;
  const article = await prisma.wikiArticle.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const role = (session.user as { role?: string }).role;
  const canDelete = article.authorId === user.id || role === "ADMIN" || role === "OWNER";
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.wikiArticle.delete({ where: { id: article.id } });
  return new NextResponse(null, { status: 204 });
}
