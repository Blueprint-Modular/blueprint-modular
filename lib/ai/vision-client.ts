/**
 * Client pour Qwen3-VL — analyse d'images et PDF scannés
 * Utilisé quand extractTextFromBuffer retourne un texte vide ou insuffisant
 */

const OLLAMA_URL = process.env.AI_SERVER_URL ?? "http://localhost:11434";
const VISION_MODEL = process.env.AI_VISION_MODEL ?? "qwen3-vl:8b";

/**
 * Extrait le texte d'une image via Qwen3-VL.
 * @param imageBase64 - Image encodée en base64 (JPEG ou PNG)
 * @param mimeType - "image/jpeg" ou "image/png"
 * @returns Texte extrait de l'image
 */
export async function extractTextFromImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: VISION_MODEL,
      stream: false,
      messages: [
        {
          role: "user",
          content:
            "Extrais tout le texte visible dans cette image de document (contrat, facture, ou autre document professionnel). " +
            "Conserve la structure du texte (paragraphes, listes, tableaux). " +
            "Retourne uniquement le texte extrait, sans commentaire ni mise en forme Markdown. " +
            "Si le document contient des tableaux, reproduis-les ligne par ligne avec des séparateurs clairs.",
          images: [imageBase64],
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(`Vision error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() ?? "";
}

/**
 * Analyse le contenu d'un document image avec une question spécifique.
 * Utilisé pour extraire des informations structurées depuis un document scanné.
 */
export async function analyzeDocumentImage(
  imageBase64: string,
  question: string,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: VISION_MODEL,
      stream: false,
      messages: [
        {
          role: "user",
          content: question,
          images: [imageBase64],
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(`Vision error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() ?? "";
}
