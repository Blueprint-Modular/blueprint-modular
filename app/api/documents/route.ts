import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
  const mime = file.type;
  const ext = path.extname(file.name) || ".pdf";
  const baseDir = path.join(process.cwd(), "uploads", user.id);
  await mkdir(baseDir, { recursive: true });
  const docId = crypto.randomUUID();
  const filePath = path.join(baseDir, `${docId}${ext}`);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buf);

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
    const { PDFParse } = (await import("pdf-parse")) as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }> } };
    const parser = new PDFParse({ data: buf });
    const textResult = await parser.getText();
    const rawText = textResult?.text ?? "";
    await prisma.document.update({
      where: { id: doc.id },
      data: { rawText: rawText.slice(0, 50000) },
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && rawText.length > 0) {
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
      const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : null;
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
    } else {
      await prisma.document.update({ where: { id: doc.id }, data: { analysisStatus: "done" } });
    }
  } catch {
    await prisma.document.update({ where: { id: doc.id }, data: { analysisStatus: "error" } });
    doc = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
  }

  return NextResponse.json(doc);
}
