/**
 * Extraction de texte depuis PDF et DOCX (côté serveur).
 * pdf-parse v1.1.1 : API simple sans worker ESM
 */

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    let extractedText = "";
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      extractedText = data?.text ?? "";
      if (extractedText.length > 0) {
        console.log(`[contract-extract] Texte natif extrait: ${extractedText.length} caractères`);
      } else {
        console.warn("[contract-extract] Aucun texte extrait du PDF (PDF scanné ?)");
      }
    } catch (err) {
      console.error("[contract-extract] PDF extraction failed:", err instanceof Error ? err.message : String(err));
    }

    return extractedText;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.toLowerCase().endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  if (mimeType === "text/plain" || filename.toLowerCase().endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Type de fichier non supporté: ${mimeType}`);
}

export function computeFileHash(buffer: Buffer): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
