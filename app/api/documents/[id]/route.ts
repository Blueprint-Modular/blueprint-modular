import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, uploadedById: user.id },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const payload = {
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    contractDate: doc.contractDate?.toISOString() ?? null,
    signatureDate: doc.signatureDate?.toISOString() ?? null,
    terminationDate: doc.terminationDate?.toISOString() ?? null,
  };
  return NextResponse.json(payload);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, uploadedById: user.id },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.filePath) {
    try {
      await unlink(doc.filePath);
    } catch {
      // ignore if file already missing
    }
  }
  await prisma.document.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
