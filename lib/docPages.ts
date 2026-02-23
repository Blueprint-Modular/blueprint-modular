/**
 * Liste ordonnée des pages de documentation des composants (pour Prev/Next).
 */
export const DOC_COMPONENT_SLUGS = [
  "metric",
  "button",
  "panel",
  "table",
  "tabs",
  "modal",
  "toggle",
  "message",
  "spinner",
  "selectbox",
  "expander",
  "tooltip",
  "numberinput",
  "title",
  "codeblock",
] as const;

export function getPrevNext(slug: string): { prev: string | null; next: string | null } {
  const i = DOC_COMPONENT_SLUGS.indexOf(slug as (typeof DOC_COMPONENT_SLUGS)[number]);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? DOC_COMPONENT_SLUGS[i - 1] : null,
    next: i < DOC_COMPONENT_SLUGS.length - 1 ? DOC_COMPONENT_SLUGS[i + 1] : null,
  };
}
