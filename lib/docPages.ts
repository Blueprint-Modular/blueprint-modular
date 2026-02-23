/**
 * Liste des pages de documentation des composants (ordre = prev/next).
 * Alimentée par le package Python : lib/generated/bpm-components.json
 * (généré via scripts/generate-bpm-components-json.py depuis bpm/_doc_components.py).
 */
import registry from "./generated/bpm-components.json";

export const DOC_COMPONENT_SLUGS = registry.components.map((c) => c.slug) as readonly string[];

export function getPrevNext(slug: string): { prev: string | null; next: string | null } {
  const i = DOC_COMPONENT_SLUGS.indexOf(slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? DOC_COMPONENT_SLUGS[i - 1] : null,
    next: i < DOC_COMPONENT_SLUGS.length - 1 ? DOC_COMPONENT_SLUGS[i + 1] : null,
  };
}
