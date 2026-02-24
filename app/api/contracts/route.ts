import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { extractTextFromBuffer, computeFileHash } from "@/lib/contract-extract";
import { analyzeContract, type ContractType } from "@/lib/ai/contract-analyzer";

export const dynamic = "force-dynamic";

/** Si vous obtenez 413 (Payload Too Large), la limite peut venir du proxy/serveur (ex. 1 Mo).
 *  Augmentez la limite côté hébergement (ex. client_max_body_size dans nginx) si besoin. */

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const { searchParams } = new URL(request.url);
  const workspace = searchParams.get("workspace");
  const contractType = searchParams.get("contractType");
  const status = searchParams.get("status");

  const where: { uploadedById: string; workspace?: string; contractType?: string; status?: string } = {
    uploadedById: user.id,
  };
  if (workspace && ["nxtfood", "beam"].includes(workspace)) where.workspace = workspace;
  if (contractType && ["supplier", "cgv", "other"].includes(contractType)) where.contractType = contractType;
  if (status && ["pending", "analyzing", "done", "error"].includes(status)) where.status = status;

  const contracts = await prisma.contract.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      contractType: true,
      workspace: true,
      originalFilename: true,
      status: true,
      analysisProgress: true,
      extractedData: true,
      createdAt: true,
      analyzedAt: true,
    },
  });

  const list = contracts.map((c) => ({
    ...c,
    overall_risk_level: (c.extractedData as { overall_risk_level?: string } | null)?.overall_risk_level ?? null,
    supplier_name: (c.extractedData as { supplier_name?: string } | null)?.supplier_name ?? null,
    contract_date: (c.extractedData as { contract_date?: string } | null)?.contract_date ?? null,
    end_date: (c.extractedData as { end_date?: string } | null)?.end_date ?? null,
  }));

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { user } = result;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const file = formData.get("file") as File | null;
  const workspace = (formData.get("workspace") as string) || "nxtfood";
  const contractType = (formData.get("contractType") as string) || "other";

  if (!file || file.size === 0) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES)
    return NextResponse.json({ error: `Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo)` }, { status: 400 });
  if (!ALLOWED_MIMES.includes(file.type))
    return NextResponse.json({ error: "Seuls PDF, DOCX et TXT sont acceptés" }, { status: 400 });
  if (!["nxtfood", "beam"].includes(workspace))
    return NextResponse.json({ error: "Workspace invalide (nxtfood ou beam)" }, { status: 400 });
  const ct = contractType as ContractType;
  if (!["supplier", "cgv", "other"].includes(ct))
    return NextResponse.json({ error: "Type de contrat invalide (supplier, cgv, other)" }, { status: 400 });

  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Impossible de lire le fichier" }, { status: 400 });
  }
  const fileHash = computeFileHash(buf);
  const existing = await prisma.contract.findFirst({
    where: { fileHash, uploadedById: user.id },
  });
  if (existing) return NextResponse.json({ error: "Un contrat avec le même fichier existe déjà" }, { status: 409 });

  const baseDir = path.join(process.cwd(), "uploads", "contracts", user.id);
  const ext = path.extname(file.name) || ".pdf";
  const title = path.basename(file.name, ext) || file.name;

  try {
    await mkdir(baseDir, { recursive: true });
  } catch (err) {
    console.error("[contracts] mkdir failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Impossible de créer le dossier d'upload. Contactez l'administrateur." },
      { status: 500 }
    );
  }

  const contract = await prisma.contract.create({
    data: {
      title,
      contractType: ct,
      workspace,
      filePath: path.join(baseDir, `temp-${Date.now()}${ext}`),
      fileHash,
      originalFilename: file.name,
      fileSizeBytes: file.size,
      status: "analyzing",
      analysisProgress: 0,
      uploadedById: user.id,
    },
  });
  const filePath = path.join(baseDir, `${contract.id}${ext}`);
  try {
    await writeFile(filePath, buf);
  } catch (err) {
    console.error("[contracts] writeFile failed:", err instanceof Error ? err.message : String(err));
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "error", analysisProgress: 0 },
    });
    const updated = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
    return NextResponse.json(updated);
  }
  await prisma.contract.update({
    where: { id: contract.id },
    data: { filePath },
  });

  try {
    const text = await extractTextFromBuffer(buf, file.type, file.name);
    await prisma.contract.update({
      where: { id: contract.id },
      data: { analysisProgress: 30 },
    });
    const extractedData = await analyzeContract(text, ct);
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        status: "done",
        analysisProgress: 100,
        extractedData: extractedData as object,
        analyzedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[contracts] analyse failed:", err instanceof Error ? err.message : String(err));
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "error", analysisProgress: 0 },
    });
  }

  const updated = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  return NextResponse.json(updated);
}
