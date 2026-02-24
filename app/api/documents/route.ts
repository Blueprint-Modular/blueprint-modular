import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vllmClient } from "@/lib/ai/vllm-client";
import { extractTextFromBuffer } from "@/lib/contract-extract";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const docs = await prisma.document.findMany({
    where: { uploadedById: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      analysisStatus: true,
      supplier: true,
      client: true,
      contractDate: true,
      terminationDate: true,
      summary: true,
      createdAt: true,
    },
  });
  return NextResponse.json(docs);
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
  if (!file || file.size === 0) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });

  const mime = file.type;
  const ext = path.extname(file.name) || ".pdf";
  const baseDir = path.join(process.cwd(), "uploads", user.id);
  const docId = crypto.randomUUID();
  const filePath = path.join(baseDir, `${docId}${ext}`);
  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Impossible de lire le fichier" }, { status: 400 });
  }

  try {
    await mkdir(baseDir, { recursive: true });
    await writeFile(filePath, buf);
  } catch (err) {
    console.error("[documents] Write file failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Impossible d'enregistrer le fichier (droits ou espace disque). Contactez l'administrateur." },
      { status: 500 }
    );
  }

  let doc = await prisma.document.create({
    data: {
      filename: file.name,
      mimeType: mime,
      filePath,
      uploadedById: user.id,
      analysisStatus: "processing",
    },
  });

  const extractPrompt = `Tu es un assistant spécialisé dans l'analyse de contrats. Analyse ce document et retourne UNIQUEMENT un objet JSON valide avec exactement ces champs :
{
  "supplier": "nom du fournisseur ou null",
  "client": "nom du client ou null",
  "contract_date": "YYYY-MM-DD ou null",
  "signature_date": "YYYY-MM-DD ou null",
  "termination_date": "YYYY-MM-DD ou null",
  "summary": "synthèse en 2-3 phrases maximum",
  "key_points": ["point clé 1", "point clé 2", "point clé 3"],
  "commitments": ["engagement 1", "engagement 2"]
}
Ne retourne rien d'autre que ce JSON. Pas de texte avant ou après. Pas de balises markdown.`;

  try {
    const rawText = (await extractTextFromBuffer(buf, mime, file.name)).slice(0, 50000);
    await prisma.document.update({
      where: { id: doc.id },
      data: { rawText },
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let parsed: Record<string, unknown> | null = null;

    if (rawText.length > 0) {
      if (apiKey) {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: `${extractPrompt}\n\n---\nDocument:\n${rawText.slice(0, 80000)}` }],
        });
        const textBlock = message.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
        const jsonStr = textBlock?.text ?? "";
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : null;
      } else {
        // Fallback : analyse via Ollama (Qwen2.5) si pas de clé Anthropic
        try {
          const { content } = await vllmClient.chat(
            [{ role: "user", content: `${extractPrompt}\n\n---\nDocument:\n${rawText.slice(0, 40000)}` }],
            { timeout: 120_000 }
          );
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : null;
        } catch (ollamaErr) {
          console.error("[documents] Analyse Ollama échouée:", ollamaErr instanceof Error ? ollamaErr.message : String(ollamaErr));
          parsed = null;
        }
      }
    }

    if (parsed) {
      const contractDate = parsed.contract_date ? new Date(String(parsed.contract_date)) : null;
      const signatureDate = parsed.signature_date ? new Date(String(parsed.signature_date)) : null;
      const terminationDate = parsed.termination_date ? new Date(String(parsed.termination_date)) : null;
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: {
          analysisStatus: "done",
          supplier: typeof parsed.supplier === "string" ? parsed.supplier : null,
          client: typeof parsed.client === "string" ? parsed.client : null,
          contractDate: contractDate && !Number.isNaN(contractDate.getTime()) ? contractDate : null,
          signatureDate: signatureDate && !Number.isNaN(signatureDate.getTime()) ? signatureDate : null,
          terminationDate: terminationDate && !Number.isNaN(terminationDate.getTime()) ? terminationDate : null,
          summary: typeof parsed.summary === "string" ? parsed.summary : null,
          keyPoints: Array.isArray(parsed.key_points) ? JSON.stringify(parsed.key_points) : null,
          commitments: Array.isArray(parsed.commitments) ? JSON.stringify(parsed.commitments) : null,
        },
      });
    } else {
      await prisma.document.update({ where: { id: doc.id }, data: { analysisStatus: "done" } });
    }
  } catch (err) {
    console.error("[documents] Erreur analyse document:", err instanceof Error ? err.message : String(err));
    await prisma.document.update({ where: { id: doc.id }, data: { analysisStatus: "error" } });
    doc = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
  }

  return NextResponse.json(doc);
}

