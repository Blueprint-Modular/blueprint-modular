/**
 * Seed : crée 3 procédures de bonne tenue dans le Wiki.
 * À exécuter après avoir au moins un utilisateur en base (ex. après inscription).
 * Usage : node prisma/seed-wiki-procedures.cjs
 * Ou : npx prisma db seed (si "prisma.seed" pointe vers ce fichier)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PROCEDURES = [
  {
    title: "Procédure de rédaction des documents (fond et forme)",
    slug: "procedure-redaction-documents",
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

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.warn("Aucun utilisateur en base. Créez un compte (inscription) puis relancez le seed.");
    process.exit(1);
  }

  for (const proc of PROCEDURES) {
    const existing = await prisma.wikiArticle.findUnique({ where: { slug: proc.slug } });
    if (existing) {
      console.log("Article déjà existant : " + proc.slug + ", mis à jour.");
      await prisma.wikiArticle.update({
        where: { id: existing.id },
        data: { title: proc.title, content: proc.content, isPublished: true },
      });
    } else {
      await prisma.wikiArticle.create({
        data: {
          title: proc.title,
          slug: proc.slug,
          content: proc.content,
          authorId: user.id,
          isPublished: true,
        },
      });
      console.log("Créé : " + proc.slug);
    }
  }
  console.log("Seed Wiki (procédures de bonne tenue) terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
