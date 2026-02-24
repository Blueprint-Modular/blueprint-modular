/**
 * Extraction de texte depuis PDF et DOCX (côté serveur).
 * pdf-parse v2 : PDFParse({ data }) + getText() → TextResult.text
 */

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    try {
      const pdf = (await import("pdf-parse")) as {
        PDFParse?: new (opts: { data: Buffer | Uint8Array }) => { getText: () => Promise<{ text: string }> };
        default?: (buf: Buffer) => Promise<{ text?: string }>;
      };
      if (pdf?.PDFParse) {
        const parser = new pdf.PDFParse({ data: buffer });
        const result = await parser.getText();
        return (result as { text?: string })?.text ?? "";
      }
      if (typeof pdf?.default === "function") {
        const data = await pdf.default(buffer);
        return data?.text ?? "";
      }
    } catch (err) {
      console.error("[contract-extract] PDF extraction failed:", err instanceof Error ? err.message : String(err));
      return "";
    }
    return "";
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
