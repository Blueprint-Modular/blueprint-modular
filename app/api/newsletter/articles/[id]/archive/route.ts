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

export async function PATCH(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  let body: { archived?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const article = await prisma.newsletterArticle.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  if (article.authorId !== result.user.id)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const archived = typeof body.archived === "boolean" ? body.archived : !article.archived;
  const updated = await prisma.newsletterArticle.update({
    where: { id },
    data: { archived },
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json(updated);
}
