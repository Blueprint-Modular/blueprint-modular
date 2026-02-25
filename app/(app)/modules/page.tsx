"use client";

import Link from "next/link";
import { Bell, BookMarked, Bot, FileText, Radio, Shield } from "lucide-react";

const modules = [
  { href: "/modules/auth", label: "Auth", description: "Authentification Google & e-mail, gestion de sessions et whitelist utilisateurs.", icon: Shield, simulatorAndDoc: true },
  { href: "/modules/wiki", label: "Wiki", description: "Créez et gérez des articles internes en Markdown avec arborescence et publication.", icon: BookMarked, simulatorAndDoc: true },
  { href: "/modules/ia", label: "IA", description: "Assistant conversationnel avec accès à votre Wiki, documents et données métier.", icon: Bot, simulatorAndDoc: true },
  { href: "/modules/documents", label: "Analyse de documents", description: "Uploadez, analysez et interrogez vos documents PDF, Word et plus avec l'IA.", icon: FileText, simulatorAndDoc: true },
  { href: "/modules/contracts", label: "Base contractuelle", description: "Centralisez contrats fournisseurs et CGV, analysez-les avec l'IA.", icon: FileText, simulatorAndDoc: true },
  { href: "/modules/veille", label: "Veille", description: "Veille et flux d’information.", icon: Radio },
  { href: "/modules/notification", label: "Notification", description: "Gérez les alertes applicatives avec 3 niveaux de priorité et un historique complet.", icon: Bell, simulatorAndDoc: true },
];

export default function ModulesPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Modules</h1>
        <p className="doc-description">
          Accédez aux modules disponibles : Auth, Wiki, IA, Documents, Veille, Notification. Chaque module dispose d&apos;une page dédiée avec description et liens utiles.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Vue d&apos;ensemble</span>
        </div>
      </div>
      <div className="grid gap-4 mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const hasSimulatorDoc = "simulatorAndDoc" in mod && (mod as { simulatorAndDoc?: boolean }).simulatorAndDoc;
          const cardClassName = "flex flex-col p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md min-h-[140px]";
          const cardStyle = { background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" };
          const linkStyle = { color: "var(--bpm-color-link)" };
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
                  {hasSimulatorDoc && (
                    <Link href={`${mod.href}/simulateur`} className="text-sm font-medium hover:underline" style={linkStyle}>
                      Simulateur
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
