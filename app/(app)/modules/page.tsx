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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col p-4 rounded-lg border transition hover:opacity-90"
              style={{
                background: "var(--bpm-bg-secondary)",
                borderColor: "var(--bpm-border)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <Icon className="w-8 h-8 mb-2 shrink-0" style={{ color: "var(--bpm-accent)" }} aria-hidden />
              <span className="font-semibold block">{mod.label}</span>
              <span className="text-sm mt-1 block" style={{ color: "var(--bpm-text-secondary)" }}>
                {mod.description}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
