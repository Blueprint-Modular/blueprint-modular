import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.aiConversation.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
