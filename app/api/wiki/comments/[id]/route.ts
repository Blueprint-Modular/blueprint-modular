import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function DELETE(
  _request: Request,
  context: { params: Params }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await resolveParams(context.params);

  const comment = await prisma.wikiComment.findUnique({
    where: { id },
    include: { article: { select: { authorId: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canDelete =
    comment.authorId === user.id ||
    comment.article.authorId === user.id ||
    user.role === "ADMIN" ||
    user.role === "OWNER";
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.wikiComment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
