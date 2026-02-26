/**
 * Templates de contenu Wiki (Procédure, Réunion, FAQ, etc.)
 */

export const WIKI_TEMPLATE_IDS = ["", "procedure", "reunion", "faq", "guide", "reference"] as const;
export type WikiTemplateId = (typeof WIKI_TEMPLATE_IDS)[number];

export const WIKI_TEMPLATE_LABELS: Record<WikiTemplateId, string> = {
  "": "Aucun",
  procedure: "Procédure",
  reunion: "Réunion",
  faq: "FAQ",
  guide: "Guide",
  reference: "Référence",
};

const TEMPLATE_CONTENT: Record<Exclude<WikiTemplateId, "">, string> = {
  procedure: `# Titre de la procédure

## Objectif
Décrire l'objectif de cette procédure.

## Prérequis
- Prérequis 1
- Prérequis 2

## Étapes
1. **Étape 1** : Description.
2. **Étape 2** : Description.
3. **Étape 3** : Description.

## Points d'attention
- Point 1
- Point 2

## Références
- Lien ou document utile
`,
  reunion: `# Compte-rendu — [Date]

## Participants
- Nom 1
- Nom 2

## Ordre du jour
1. Sujet 1
2. Sujet 2
3. Sujet 3

## Décisions
| Sujet | Décision |
|-------|----------|
| Sujet 1 | Décision prise |
| Sujet 2 | À revoir |

## Actions
- [ ] Action 1 — Responsable — Date
- [ ] Action 2 — Responsable — Date

## Prochaine réunion
Date et sujets prévus.
`,
  faq: `# FAQ — [Sujet]

## Question 1 ?
Réponse à la question 1.

## Question 2 ?
Réponse à la question 2.

## Question 3 ?
Réponse à la question 3.
`,
  guide: `# Guide — [Sujet]

## Introduction
Contexte et objectif du guide.

## Section 1
Contenu de la première section.

## Section 2
Contenu de la deuxième section.

## Section 3
Contenu de la troisième section.

## Conclusion
Récapitulatif et prochaines étapes.
`,
  reference: `# Référence — [Sujet]

## Définition
Définition ou description courte.

## Détails
Contenu détaillé (tableaux, listes, exemples).

## Voir aussi
- [[autre-article]]
- Lien externe
`,
};

export function getWikiTemplateContent(id: Exclude<WikiTemplateId, "">): string {
  return TEMPLATE_CONTENT[id] ?? "";
}
