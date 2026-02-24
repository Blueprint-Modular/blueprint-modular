/**
 * Normalise une chaîne en slug pour URLs (minuscules, espaces → tirets, accents → ASCII).
 * Ex. "Procédure IT" → "procedure-it", "Généré du titre" → "genere-du-titre"
 */
export function normalizeSlug(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les marques diacritiques (é → e, etc.)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
