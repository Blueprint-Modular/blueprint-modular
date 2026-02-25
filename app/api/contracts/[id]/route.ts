import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";

export const dynamic = "force-dynamic";

async function getContractAndCheckAuth(id: string) {
  const result = await getSessionOrTestUser();
  if (!result) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { user } = result;
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (contract.uploadedById !== user.id)
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { contract, user };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = context.params;
  const id = typeof (params as Promise<{ id: string }>).then === "function"
    ? (await (params as Promise<{ id: string }>)).id
    : (params as { id: string }).id;
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const result = await getContractAndCheckAuth(id);
  if ("error" in result) return result.error;
  const c = result.contract;
  return NextResponse.json({
    id: c.id,
    title: c.title,
    contractType: c.contractType,
    workspace: c.workspace,
    originalFilename: c.originalFilename,
    status: c.status,
    analysisProgress: c.analysisProgress,
    extractedData: c.extractedData,
    createdAt: c.createdAt.toISOString(),
    analyzedAt: c.analyzedAt?.toISOString() ?? null,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = context.params;
  const id = typeof (params as Promise<{ id: string }>).then === "function"
    ? (await (params as Promise<{ id: string }>)).id
    : (params as { id: string }).id;
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const result = await getContractAndCheckAuth(id);
  if ("error" in result) return result.error;
  const { contract } = result;
  try {
    await unlink(contract.filePath).catch(() => {});
  } catch {
    // ignore
  }
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
