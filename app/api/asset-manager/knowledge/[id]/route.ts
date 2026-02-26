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

export async function GET(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const article = await prisma.knowledgeArticle.findUnique({
    where: { id },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    categoryId?: string;
    assetTypeId?: string | null;
    tags?: string[];
    visibility?: string;
    validatedById?: string | null;
    publishedAt?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.content !== undefined) data.content = body.content.trim();
  if (body.categoryId !== undefined) data.categoryId = body.categoryId.trim();
  if (body.assetTypeId !== undefined) data.assetTypeId = body.assetTypeId?.trim() || null;
  if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? body.tags : existing.tags;
  if (body.visibility !== undefined) data.visibility = body.visibility === "public" ? "public" : "technicians_only";
  if (body.validatedById !== undefined) data.validatedById = body.validatedById || null;
  if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;

  const updated = await prisma.knowledgeArticle.update({
    where: { id },
    data: data as never,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  await prisma.knowledgeArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
