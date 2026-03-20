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

function safeJsonClone(value: unknown): unknown {
  if (value == null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = context.params;
    const resolved = typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const result = await getContractAndCheckAuth(id);
    if ("error" in result) return result.error;
    const c = result.contract;
    const payload = {
      id: c.id,
      title: c.title,
      contractType: c.contractType,
      workspace: c.workspace,
      originalFilename: c.originalFilename,
      status: c.status,
      analysisProgress: c.analysisProgress,
      extractedData: safeJsonClone(c.extractedData),
      createdAt: c.createdAt.toISOString(),
      analyzedAt: c.analyzedAt?.toISOString() ?? null,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[contracts] GET [id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = context.params;
    const resolved = typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const result = await getContractAndCheckAuth(id);
    if ("error" in result) return result.error;
    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.contractType !== undefined) updateData.contractType = body.contractType;
    if (body.workspace !== undefined) updateData.workspace = body.workspace;
    if (body.extractedData !== undefined) {
      const currentData = result.contract.extractedData as any || {};
      updateData.extractedData = { ...currentData, ...body.extractedData };
    }
    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      contractType: updated.contractType,
      workspace: updated.workspace,
      originalFilename: updated.originalFilename,
      status: updated.status,
      analysisProgress: updated.analysisProgress,
      extractedData: safeJsonClone(updated.extractedData),
      createdAt: updated.createdAt.toISOString(),
      analyzedAt: updated.analyzedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[contracts] PUT [id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = context.params;
    const resolved = typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const result = await getContractAndCheckAuth(id);
    if ("error" in result) return result.error;
    const { contract } = result;
    await unlink(contract.filePath).catch(() => {});
    await prisma.contract.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contracts] DELETE [id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
