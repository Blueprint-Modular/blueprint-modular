"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, BookMarked, Bot, Calendar, FileText, LayoutDashboard, Link2, Mail, MessageSquare, Monitor, Package, PenTool, Radio, Settings, Shield, StickyNote, Table2, Webhook } from "lucide-react";
import { Input } from "@/components/bpm";

/** Catégories dans l’ordre d’affichage. À l’intérieur de chaque catégorie, les modules sont triés par label. */
const CATEGORY_ORDER = [
  "Authentification",
  "Contenu & productivité",
  "Données & reporting",
  "Processus & workflow",
  "Intégrations & technique",
  "Métier",
] as const;

type ModuleEntry = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  simulatorAndDoc: boolean;
  /** Si défini, le lien « Simulateur » pointe vers cette URL au lieu de href/simulateur (ex. Wiki → page du module). */
  simulateurHref?: string;
};

const MODULES_BY_CATEGORY: Record<(typeof CATEGORY_ORDER)[number], ModuleEntry[]> = {
  Authentification: [
    { href: "/modules/auth", label: "Auth", description: "Authentification Google & e-mail, gestion de sessions et whitelist utilisateurs.", icon: Shield, simulatorAndDoc: true },
  ],
  "Contenu & productivité": [
    { href: "/modules/calendrier", label: "Calendrier", description: "Agenda jour / semaine / mois, événements et rappels.", icon: Calendar, simulatorAndDoc: true },
    { href: "/modules/commentaires", label: "Commentaires", description: "Commentaires et annotations sur une entité (document, ligne, projet).", icon: MessageSquare, simulatorAndDoc: true },
    { href: "/modules/skeleton", label: "Skeleton", description: "Assemblages de bpm.skeleton pour un chargement de page complet (header, métriques, tableau).", icon: LayoutDashboard, simulatorAndDoc: true },
    { href: "/modules/tableau-blanc", label: "Tableau blanc", description: "Post-it et zones de texte pour rétros ou ateliers.", icon: StickyNote, simulatorAndDoc: true },
    { href: "/modules/templates", label: "Templates", description: "Bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir.", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/newsletter", label: "Newsletter", description: "Photo de header, création d'articles et archivage des numéros.", icon: Mail, simulatorAndDoc: true, simulateurHref: "/modules/newsletter" },
    { href: "/modules/wiki", label: "Wiki", description: "Créez et gérez des articles internes en Markdown avec arborescence et publication.", icon: BookMarked, simulatorAndDoc: true, simulateurHref: "/modules/wiki" },
    { href: "/modules/monitor", label: "Monitor", description: "Téléprompte IA pour présentations — import PPTX, suggestions Q&R, traduction et résumé de séance.", icon: Monitor, simulatorAndDoc: true, simulateurHref: "/modules/monitor" },
  ],
  "Données & reporting": [
    { href: "/modules/contracts", label: "Base contractuelle", description: "Centralisez contrats fournisseurs et CGV, analysez-les avec l'IA.", icon: FileText, simulatorAndDoc: true, simulateurHref: "/modules/contracts" },
    { href: "/modules/documents", label: "Analyse de documents", description: "Uploadez, analysez et interrogez vos documents PDF, Word et plus avec l'IA.", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/export-planifie", label: "Export planifié", description: "Envoi périodique par email de rapports ou exports (PDF/CSV).", icon: Mail, simulatorAndDoc: true },
    { href: "/modules/rapports", label: "Rapports", description: "Création de rapports à partir de données (champs, filtres, graphiques prédéfinis).", icon: Table2, simulatorAndDoc: true },
    { href: "/modules/referentiels", label: "Référentiels", description: "CRUD simple pour listes métier (devises, pays, types) utilisables dans les formulaires.", icon: Table2, simulatorAndDoc: true },
    { href: "/modules/tableaux-de-bord", label: "Tableaux de bord", description: "Disposition de widgets (métriques, graphiques, tableaux) par l'utilisateur.", icon: LayoutDashboard, simulatorAndDoc: true },
    { href: "/modules/veille", label: "Veille", description: "Veille et flux d'information.", icon: Radio, simulatorAndDoc: false },
  ],
  "Processus & workflow": [
    { href: "/modules/audit-log", label: "Audit / Log", description: "Consultation des changements sur une entité (qui, quand, quoi).", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/notification", label: "Notification", description: "Gérez les alertes applicatives avec 3 niveaux de priorité et un historique complet.", icon: Bell, simulatorAndDoc: true },
    { href: "/modules/notifications-ciblees", label: "Notifications ciblées", description: "Règles événement → destinataires et message.", icon: Bell, simulatorAndDoc: true },
    { href: "/modules/taches", label: "Tâches", description: "Liste de tâches avec assignation, échéance et statut.", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/workflow", label: "Workflow", description: "États et transitions (brouillon → validé → archivé) avec historique.", icon: PenTool, simulatorAndDoc: true },
  ],
  "Intégrations & technique": [
    { href: "/modules/connecteurs", label: "Connecteurs", description: "Configuration de sources (API, SFTP, base) pour alimenter les données.", icon: Link2, simulatorAndDoc: true },
    { href: "/modules/ia", label: "IA", description: "Assistant conversationnel avec accès à votre Wiki, documents et données métier.", icon: Bot, simulatorAndDoc: true },
    { href: "/modules/multi-langue", label: "Multi-langue", description: "Sélection de langue et textes traduisibles pour l'UI et les contenus.", icon: Settings, simulatorAndDoc: true },
    { href: "/modules/themes", label: "Thèmes / White-label", description: "Choix de thème, logo et couleurs par instance ou client.", icon: Settings, simulatorAndDoc: true },
    { href: "/modules/webhooks", label: "Webhooks", description: "Émission d'événements vers des URLs externes (validation, création, etc.).", icon: Webhook, simulatorAndDoc: true },
  ],
  Métier: [
    { href: "/modules/asset-manager", label: "Gestion d'actifs", description: "Actifs, tickets et mises à disposition configurables par domaine (IT, maintenance).", icon: Package, simulatorAndDoc: true, simulateurHref: "/modules/asset-manager" },
    { href: "/modules/catalogue-produits", label: "Catalogue produits", description: "Fiche produit, variantes, prix, stock (codes-barres / QR).", icon: Package, simulatorAndDoc: true },
    { href: "/modules/devis-facturation", label: "Devis / Facturation", description: "Lignes, totaux, PDF, statuts (brouillon, envoyé, payé).", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/formulaire-dynamique", label: "Formulaire dynamique", description: "Formulaires dont les champs dépendent d'un type ou référentiel.", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/reservation-creneaux", label: "Réservation / Créneaux", description: "Choix de créneaux ou de ressources avec disponibilités.", icon: Calendar, simulatorAndDoc: true },
  ],
};

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const linkStyle = { color: "var(--bpm-accent-cyan)" };

  const keywords = useMemo(
    () =>
      searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery]
  );

  const filteredByCategory = useMemo(() => {
    if (keywords.length === 0) {
      return Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, MODULES_BY_CATEGORY[cat]])) as typeof MODULES_BY_CATEGORY;
    }
    const out: Partial<Record<(typeof CATEGORY_ORDER)[number], typeof MODULES_BY_CATEGORY[(typeof CATEGORY_ORDER)[number]]>> = {};
    for (const category of CATEGORY_ORDER) {
      const items = MODULES_BY_CATEGORY[category] ?? [];
      const filtered = items.filter((mod) => {
        const text = `${mod.label} ${mod.description} ${category}`.toLowerCase();
        return keywords.every((kw) => text.includes(kw));
      });
      if (filtered.length) out[category] = filtered;
    }
    return out;
  }, [keywords]);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Modules</h1>
        <p className="doc-description">
          Modules disponibles, classés par catégorie. Chaque module dispose d&apos;une page avec Documentation et Simulateur pour tester en ligne.
        </p>
        <div className="mt-4 max-w-md">
          <Input
            type="search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un module (mots-clés…)"
            aria-label="Rechercher un module par mots-clés"
          />
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = filteredByCategory[category];
        if (!items?.length) return null;
        return (
          <section key={category} className="mb-10">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--bpm-text-primary)" }}>
              {category}
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {items.map((mod) => {
                const Icon = mod.icon;
                const cardClassName = "flex flex-col p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md min-h-[140px]";
                const cardStyle = { background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" };
                return (
                  <div key={mod.href} className={`block ${cardClassName}`} style={cardStyle}>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                        style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-accent-cyan)" }}
                      >
                        <Icon className="w-5 h-5" aria-hidden />
                      </span>
                      <span className="font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
                        {mod.label}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-h-0">
                      <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", marginLeft: "52px" }}>
                        {mod.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-auto pt-3" style={{ marginLeft: "52px" }}>
                        <Link href={`${mod.href}/documentation`} className="text-sm font-medium hover:underline" style={linkStyle}>
                          Documentation
                        </Link>
                        {mod.simulatorAndDoc && (
                          <Link href={mod.simulateurHref ?? `${mod.href}/simulateur`} className="text-sm font-medium hover:underline" style={linkStyle}>
                            Simulateur
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
