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
    let extractedText = "";
    try {
      const pdf = (await import("pdf-parse")) as {
        PDFParse?: new (opts: { data: Buffer | Uint8Array }) => { getText: () => Promise<{ text: string }> };
        default?: (buf: Buffer) => Promise<{ text?: string }>;
      };
      if (pdf?.PDFParse) {
        const parser = new pdf.PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = (result as { text?: string })?.text ?? "";
      } else if (typeof pdf?.default === "function") {
        const data = await pdf.default(buffer);
        extractedText = data?.text ?? "";
      }
    } catch (err) {
      console.error("[contract-extract] PDF extraction failed:", err instanceof Error ? err.message : String(err));
    }

    // Si le texte extrait est trop court (< 200 chars), c'est probablement un PDF scanné
    // On tente une extraction via Qwen3-VL sur plusieurs pages
    if (extractedText.length < 200 && mimeType === "application/pdf") {
      try {
        const { extractTextFromImage } = await import("@/lib/ai/vision-client");
        const { fromBuffer } = await import("pdf2pic");
        const pdfParse = (await import("pdf-parse")) as {
          default?: (buf: Buffer) => Promise<{ numPages?: number; text?: string }>;
        };

        // Obtenir le nombre de pages
        let numPages = 1;
        try {
          if (typeof pdfParse?.default === "function") {
            const pdfInfo = await pdfParse.default(buffer);
            numPages = pdfInfo?.numPages ?? 1;
          }
        } catch {
          // Si on ne peut pas obtenir le nombre de pages, on traite au moins la première
        }

        const converter = fromBuffer(buffer, {
          density: 200, // Augmenté pour meilleure qualité OCR
          saveFilename: "page",
          savePath: "/tmp",
          format: "jpeg",
          width: 1600, // Augmenté pour meilleure résolution
          height: 2200,
        });

        // Traiter jusqu'à 5 pages ou jusqu'à avoir assez de texte (min 1000 chars)
        const maxPages = Math.min(numPages, 5);
        const minChars = 1000;

        for (let pageNum = 1; pageNum <= maxPages && extractedText.length < minChars; pageNum++) {
          try {
            const pageImage = await converter(pageNum, { responseType: "base64" });
            const base64 = typeof pageImage === "string" ? pageImage : (pageImage as { base64?: string })?.base64;
            if (base64) {
              const visionText = await extractTextFromImage(base64, "image/jpeg");
              if (visionText.length > 0) {
                // Ajouter un séparateur entre les pages
                extractedText += (extractedText.length > 0 ? "\n\n--- Page " + pageNum + " ---\n\n" : "") + visionText;
              }
            }
          } catch (pageErr) {
            console.warn(`[contract-extract] Erreur page ${pageNum}:`, pageErr instanceof Error ? pageErr.message : String(pageErr));
            // Continue avec les pages suivantes même si une page échoue
          }
        }

        console.log(`[contract-extract] Extraction vision: ${extractedText.length} caractères depuis ${Math.min(maxPages, numPages)} page(s)`);
      } catch (visionErr) {
        console.warn(
          "[contract-extract] Vision fallback échoué:",
          visionErr instanceof Error ? visionErr.message : String(visionErr)
        );
      }
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
