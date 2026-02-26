import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

async function getArticleAndCheckAuth(id: string) {
  const result = await getSessionOrTestUser();
  if (!result) return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  const article = await prisma.newsletterArticle.findUnique({ where: { id }, include: { author: { select: { name: true, email: true } } } });
  if (!article) return { error: NextResponse.json({ error: "Article introuvable" }, { status: 404 }) };
  if (article.authorId !== result.user.id)
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  return { article, user: result.user };
}

export async function GET(_request: Request, context: { params: Params }) {
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
  const result = await getArticleAndCheckAuth(id);
  if ("error" in result) return result.error;
  return NextResponse.json(result.article);
}

export async function PUT(request: Request, context: { params: Params }) {
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
  const result = await getArticleAndCheckAuth(id);
  if ("error" in result) return result.error;

  let body: { title?: string; content?: string; excerpt?: string | null; publishedAt?: string | null; archived?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const data: {
    title?: string;
    content?: string;
    excerpt?: string | null;
    publishedAt?: Date | null;
    archived?: boolean;
  } = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.content === "string") data.content = body.content;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt === null || body.excerpt === "" ? null : String(body.excerpt).trim();
  if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  if (typeof body.archived === "boolean") data.archived = body.archived;

  const article = await prisma.newsletterArticle.update({
    where: { id },
    data,
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json(article);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
  const result = await getArticleAndCheckAuth(id);
  if ("error" in result) return result.error;
  await prisma.newsletterArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
