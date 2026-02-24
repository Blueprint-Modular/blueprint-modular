"use client";

import Link from "next/link";
import { Bell, BookMarked, Bot, FileText, Radio, Shield } from "lucide-react";

const modules = [
  { href: "/modules/auth", label: "Auth", description: "Authentification (Google, e-mail), session et whitelist.", icon: Shield },
  { href: "/modules/wiki", label: "Wiki", description: "Wiki interne et pages documentées.", icon: BookMarked, simulatorAndDoc: true },
  { href: "/modules/ia", label: "IA", description: "Assistant et chat IA.", icon: Bot, simulatorAndDoc: true },
  { href: "/modules/documents", label: "Analyse de documents", description: "Analyse et gestion de documents.", icon: FileText, simulatorAndDoc: true },
  { href: "/modules/contracts", label: "Base contractuelle", description: "Contrats fournisseurs et CGV : upload, analyse IA, consultation.", icon: FileText, simulatorAndDoc: true },
  { href: "/modules/veille", label: "Veille", description: "Veille et flux d’information.", icon: Radio },
  { href: "/modules/notification", label: "Notification", description: "Historique des notifications, cloche dans le header, niveaux 1–3.", icon: Bell },
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
      <div className="grid gap-4 mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const hasSimulatorDoc = "simulatorAndDoc" in mod && (mod as { simulatorAndDoc?: boolean }).simulatorAndDoc;
          const cardContent = (
            <>
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
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", marginLeft: "52px" }}>
                {mod.description}
              </p>
              <div className="flex flex-wrap gap-3 mt-3" style={{ marginLeft: "52px" }}>
                {hasSimulatorDoc ? (
                  <>
                    <Link
                      href={mod.href}
                      className="text-sm font-medium"
                      style={{ color: "var(--bpm-accent-cyan)" }}
                    >
                      Simulateur
                    </Link>
                    <Link
                      href={`${mod.href}#documentation`}
                      className="text-sm font-medium"
                      style={{ color: "var(--bpm-accent-cyan)" }}
                    >
                      Documentation
                    </Link>
                  </>
                ) : (
                  <Link
                    href={mod.href}
                    className="text-sm font-medium"
                    style={{ color: "var(--bpm-accent-cyan)" }}
                  >
                    Ouvrir →
                  </Link>
                )}
              </div>
            </>
          );
          if (hasSimulatorDoc) {
            return (
              <div
                key={mod.href}
                className="block p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md"
                style={{
                  background: "var(--bpm-bg-primary)",
                  borderColor: "var(--bpm-border)",
                }}
              >
                {cardContent}
              </div>
            );
          }
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="block p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
