"use client";

import Link from "next/link";
import { Bell, BookMarked, Bot, FileText, Radio, Shield } from "lucide-react";

const modules = [
  { href: "/modules/auth", label: "Module Auth", description: "Authentification (Google, e-mail), session et whitelist.", icon: Shield },
  { href: "/modules/wiki", label: "Module Wiki", description: "Wiki interne et pages documentées.", icon: BookMarked },
  { href: "/modules/ia", label: "Module IA", description: "Assistant et chat IA.", icon: Bot },
  { href: "/modules/documents", label: "Module Documents", description: "Analyse et gestion de documents.", icon: FileText },
  { href: "/modules/veille", label: "Module Veille", description: "Veille et flux d’information.", icon: Radio },
  { href: "/modules/notification", label: "Module Notification", description: "Historique des notifications, cloche dans le header, niveaux 1–3.", icon: Bell },
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
              <span
                className="inline-block mt-2 text-sm font-medium"
                style={{ color: "var(--bpm-accent-cyan)", marginLeft: "52px" }}
              >
                Ouvrir →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
