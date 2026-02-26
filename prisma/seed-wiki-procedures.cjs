/**
 * Seed : crée 8 à 10 articles professionnels dans le Wiki (procédures, guides, FAQ, référence).
 * CDC Phase 1 : articles avec tags, hiérarchie (parentId) et backlinks [[slug]].
 * À exécuter après avoir au moins un utilisateur en base.
 * Usage : node prisma/seed-wiki-procedures.cjs
 * Ou : npx prisma db seed
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/** Article de référence statique pour liens entrants et simulateur (CDC Bug 1). */
const GUIDE_MARKDOWN = {
  title: "Guide Markdown",
  slug: "guide-markdown",
  excerpt: "Référence des capacités Markdown du module Wiki : titres, listes, code, tableaux, callouts.",
  tags: ["guide", "markdown", "référence"],
  parentSlug: null,
  content: `# Guide Markdown

Ce document sert de référence statique pour le bac à sable et les liens entrants.

## Titres et texte

**Gras**, *italique*, ~~barré~~, \`code inline\`.

> Blockquote pour citations.

Liste à puces :
- Premier point
- Deuxième point

Liste numérotée :
1. Étape un
2. Étape deux

## Code et tableaux

\`\`\`javascript
function hello() { return "Bonjour"; }
\`\`\`

| Colonne A | Colonne B |
|-----------|-----------|
| Donnée 1  | Donnée 2  |

## Liens inter-articles

Voir [[procedure-redaction-documents]] pour la procédure de rédaction.

## Ressources

- [[procedure-tenue-reunions]]
- [[procedure-communication-ecrite-orale]]`,
};

/** Articles supplémentaires avec hiérarchie et backlinks (CDC seed 8–10 articles). */
const EXTRA_ARTICLES = [
  {
    title: "Onboarding RH",
    slug: "onboarding-rh",
    excerpt: "Bienvenue et premiers pas pour les nouveaux collaborateurs.",
    tags: ["onboarding", "RH", "équipe"],
    parentSlug: null,
    content: `# Onboarding RH

## Objectif

Accueillir les nouveaux collaborateurs et leur donner les clés pour démarrer.

## Premiers pas

1. Réception du kit d'accueil.
2. Configuration du poste (voir [[procedure-reinitialisation-mdp]] si besoin).
3. Prise de rendez-vous avec le responsable.

## Ressources

- [[procedure-redaction-documents]] pour les documents internes.
- [[faq-equipe]] pour les questions fréquentes.`,
  },
  {
    title: "Procédure réinitialisation mot de passe",
    slug: "procedure-reinitialisation-mdp",
    excerpt: "Réinitialisation du mot de passe (IT) : étapes et bonnes pratiques.",
    tags: ["IT", "sécurité", "procédure"],
    parentSlug: null,
    content: `# Procédure réinitialisation mot de passe

## Contexte

En cas d'oubli ou d'expiration du mot de passe, suivre cette procédure.

## Étapes

1. Contacter le support IT ou utiliser le portail d'auto-réinitialisation.
2. Vérifier son identité (email, badge).
3. Choisir un mot de passe conforme à la politique (voir [[documentation-produit]]).

## Références

- [[procedure-communication-ecrite-orale]] pour les échanges avec le support.`,
  },
  {
    title: "FAQ Équipe",
    slug: "faq-equipe",
    excerpt: "Questions fréquentes : horaires, congés, outils, contacts.",
    tags: ["FAQ", "équipe", "onboarding"],
    parentSlug: null,
    content: `# FAQ Équipe

## Horaires et congés

**Quels sont les horaires ?** Flexibles avec plage obligatoire 10h–16h.

**Comment poser un congé ?** Via l’outil RH ; voir [[onboarding-rh]] pour les nouveaux.

## Outils

**Accès au Wiki ?** Tous les collaborateurs. Création d’articles selon droits.

**Référence Markdown :** [[guide-markdown]].`,
  },
  {
    title: "Documentation Produit",
    slug: "documentation-produit",
    excerpt: "Vue d'ensemble du produit et de la documentation technique.",
    tags: ["produit", "documentation", "guide"],
    parentSlug: null,
    content: `# Documentation Produit

## Vue d'ensemble

Ce document regroupe les liens vers les procédures et guides métier.

## Procédures clés

- [[procedure-redaction-documents]]
- [[procedure-tenue-reunions]]
- [[procedure-reinitialisation-mdp]]

## Référence

- [[guide-markdown]] pour la syntaxe Markdown du Wiki.`,
  },
  {
    title: "Premiers pas (Onboarding)",
    slug: "onboarding-premiers-pas",
    excerpt: "Checklist des premiers pas pour un nouveau collaborateur.",
    tags: ["onboarding", "checklist"],
    parentSlug: "onboarding-rh",
    content: `# Premiers pas

Article enfant de [[onboarding-rh]].

## Checklist

- [ ] Kit d'accueil reçu
- [ ] Poste configuré (voir [[procedure-reinitialisation-mdp]] si blocage)
- [ ] Rencontre avec le responsable

Voir aussi [[faq-equipe]].`,
  },
];

const PROCEDURES = [
  {
    title: "Procédure de rédaction des documents (fond et forme)",
    slug: "procedure-redaction-documents",
    excerpt: "Critères de fond (exactitude, structure, vocabulaire) et de forme (mise en page, typographie, relecture) pour les documents internes.",
    tags: ["rédaction", "documents", "qualité", "procédure"],
    content: `# Procédure de rédaction des documents (fond et forme)

## #objectif
Garantir que tous les documents internes (notes, rapports, comptes-rendus) respectent des critères de fond (contenu) et de forme (présentation) pour la clarté et la traçabilité.

## #fond

### #exactitude
- Vérifier les chiffres, dates et noms propres avant publication.
- Citer les sources lorsque l'information provient d'un tiers.
- Distinguer les faits des hypothèses ou avis.

### #structure_du_contenu
- Une idée par paragraphe ; premier alinéa = idée directrice.
- Enchaînement logique (chronologique, thématique ou par ordre d'importance).
- Conclusion ou synthèse en fin de document si le document dépasse une page.

### #vocabulaire
- Utiliser un langage professionnel et neutre.
- Éviter le jargon non défini ; expliciter les acronymes à la première occurrence.
- Privilégier la voix active et les phrases courtes.

## #forme

### #mise_en_page
- Marges et interlignes homogènes (ex. 1,15 ou 1,5).
- Titres hiérarchisés (Titre 1, Titre 2) pour faciliter la navigation.
- Pagination et en-tête / pied de page avec titre court et date si pertinent.

### #typographie
- Police lisible (ex. 11–12 pt pour le corps de texte).
- Gras ou italique pour mettre en avant, sans abus.
- Listes à puces ou numérotées pour les énumérations.

### #relecture
- Relire au moins une fois avant envoi ou publication.
- Vérifier l'orthographe, la grammaire et la cohérence des titres avec le sommaire.

## #références
- Modèle type : voir article « Modèles de documents » dans le Wiki.
- Mise à jour : revue annuelle ; responsable : direction ou qualité.`,
  },
  {
    title: "Procédure de tenue des réunions",
    slug: "procedure-tenue-reunions",
    excerpt: "Préparation, déroulement et suivi des réunions : ordre du jour, animation, compte-rendu et tableau des actions.",
    tags: ["réunions", "ordre du jour", "compte-rendu", "procédure"],
    content: `# Procédure de tenue des réunions

## #objectif
Assurer l'efficacité et la traçabilité des réunions (équipe, projet, comité) par une préparation, un déroulement et un suivi structurés.

## #fond

### #avant_la_reunion
- Ordre du jour envoyé au moins 48 h à l'avance avec objectifs et durée prévue.
- Documents de préparation partagés si nécessaire (lecture préalable).
- Salle ou lien visio réservé ; convocation avec participants, horaire, lieu/lien.

### #pendant_la_reunion
- Rappel de l'ordre du jour et du temps alloué par point.
- Animation : tour de table si besoin, gestion des dérives et du temps.
- Décisions et actions notées en direct (qui, quoi, échéance).
- Clôture par un récapitulatif des décisions et prochaines étapes.

### #apres_la_reunion
- Compte-rendu (CR) envoyé sous 48 h : participants, décisions, actions avec responsables et dates.
- Stockage du CR dans l'espace partagé ou le Wiki (référence unique).
- Relance des responsables d'actions si nécessaire avant la prochaine réunion.

## #forme

### #ordre_du_jour
- Titre de la réunion, date, lieu/lien, liste des participants.
- Points numérotés avec objectif et durée indicative.
- Pièces jointes listées.

### #compte_rendu
- En-tête : réunion, date, participants, rédacteur du CR.
- Sections alignées sur l'ordre du jour.
- Tableau des actions : action, responsable, échéance, statut.
- Signature ou validation du CR par l'animateur ou le responsable.

### #vocabulaire_et_ton
- Neutre et factuel ; pas de jugement dans le CR.
- Verbes d'action pour les tâches (« valider », « envoyer », « rédiger »).

## #références
- Modèles : ordre du jour et CR types dans le Wiki, rubrique « Réunions ».
- Mise à jour : revue annuelle ; pilote : direction ou chef de projet.`,
  },
  {
    title: "Procédure de communication écrite et orale",
    slug: "procedure-communication-ecrite-orale",
    excerpt: "Échanges professionnels : contexte, message, canal (courriel, messagerie, oral, présentations) et bonnes pratiques.",
    tags: ["communication", "courriel", "réunion", "procédure"],
    content: `# Procédure de communication écrite et orale

## #objectif
Homogénéiser les échanges (courriels, messages, présentations, échanges oraux) pour une communication professionnelle, claire et adaptée au contexte.

## #fond

### #identification_du_contexte
- Définir le destinataire (interne, externe, hiérarchie, client).
- Choisir le canal adapté : courriel pour la trace écrite, messagerie pour le court, réunion pour le débat ou la décision collective.
- Adapter le niveau de détail et le ton (formel / informel) au contexte.

### #message
- Objet ou intention claire dès le début (sujet du mail, objectif de la prise de parole).
- Message structuré : contexte en une phrase si besoin, développement, conclusion ou demande explicite.
- Une idée principale par message ou par paragraphe ; éviter les digressions.

### #preuves_et_sources
- Données chiffrées ou citations sourcées lorsque c'est nécessaire.
- Pièces jointes nommées de façon explicite (pas « doc1.pdf » mais « CR_reunion_2025-02-20.pdf »).

## #forme

### #ecrit
- Objet de mail court et explicite (éviter « RE: RE: » sans reformulation).
- Formules d'appel et de politesse adaptées (tu / vous, formel / décontracté selon la culture d'entreprise).
- Signature avec nom, fonction, coordonnées utiles si pertinent.
- Relire avant envoi ; pas de message sensible ou définitif sous le coup de l'émotion.

### #oral
- Débit maîtrisé ; pauses pour laisser réagir.
- Reformuler les questions avant de répondre en réunion.
- Résumer les points clés en fin d'intervention si le sujet est complexe.

### #presentations
- Titre de slide = message principal de la slide.
- Peu de texte par slide ; privilégier schémas et listes courtes.
- Numérotation des slides et reprise des conclusions en fin de présentation.

## #références
- Charte de communication interne (si existante) ; modèles de mails dans le Wiki.
- Mise à jour : revue annuelle ; pilote : direction ou communication interne.`,
  },
];

function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function readingTimeMinutes(text) {
  return Math.max(1, Math.ceil(countWords(text) / 200));
}

async function main() {
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log("Aucun utilisateur en base : création d'un utilisateur de seed pour le Wiki…");
    user = await prisma.user.create({
      data: {
        email: "wiki-seed@blueprint-modular.local",
        name: "Wiki Seed",
        role: "USER",
      },
    });
    console.log("Utilisateur créé : " + user.email);
  }

  const upsert = async (art, parentId = null) => {
    const wordCount = countWords(art.content);
    const readingTime = readingTimeMinutes(art.content);
    const data = {
      title: art.title,
      content: art.content,
      isPublished: true,
      excerpt: art.excerpt || null,
      tags: art.tags || [],
      wordCount,
      readingTimeMinutes: readingTime,
      lastRevisedBy: user.name,
      parentId,
    };
    const existing = await prisma.wikiArticle.findUnique({ where: { slug: art.slug } });
    if (existing) {
      await prisma.wikiArticle.update({ where: { id: existing.id }, data });
      console.log("Mis à jour : " + art.slug);
    } else {
      await prisma.wikiArticle.create({
        data: { ...data, slug: art.slug, authorId: user.id },
      });
      console.log("Créé : " + art.slug);
    }
  };

  for (const proc of PROCEDURES) await upsert(proc);
  await upsert(GUIDE_MARKDOWN);

  const roots = EXTRA_ARTICLES.filter((a) => !a.parentSlug);
  const children = EXTRA_ARTICLES.filter((a) => a.parentSlug);
  for (const art of roots) await upsert(art);
  for (const art of children) {
    const parent = await prisma.wikiArticle.findUnique({ where: { slug: art.parentSlug } });
    await upsert(art, parent ? parent.id : null);
  }

  console.log("Seed Wiki terminé : " + (PROCEDURES.length + 1 + EXTRA_ARTICLES.length) + " articles (procédures, guide-markdown, onboarding, FAQ, backlinks).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
