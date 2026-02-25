"use client";

import Link from "next/link";

const cardStyle = {
  background: "var(--bpm-bg-primary)",
  borderColor: "var(--bpm-border)",
};
const linkStyle = { color: "var(--bpm-accent-cyan)" };

export default function AuthSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/auth">Auth</Link>
          {" → "}
          Simulateur
        </div>
        <h1>Simulateur — Auth</h1>
        <p className="doc-description">
          Testez les trois modèles de page de connexion : carte centrée, split et Google seul.
        </p>
      </div>

      <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        <div className="p-5 rounded-xl border" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
            1. Carte centrée (par défaut)
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Formulaire dans une carte centrée, option Google + e-mail.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
              style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
            >
              Aperçu connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
              style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
            >
              Aperçu inscription
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
            2. Modèle split
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Formulaire à gauche, image à droite (équipe, collaboration).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?layout=split"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
              style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
            >
              Aperçu connexion
            </Link>
            <Link
              href="/register?layout=split"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
              style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
            >
              Aperçu inscription
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
            3. Google seul
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Un seul bouton « Google », pas de formulaire e-mail.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?showEmailOption=false"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
              style={{ ...linkStyle, borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
            >
              Aperçu connexion
            </Link>
          </div>
        </div>
      </div>

      <nav className="doc-pagination">
        <Link href="/modules/auth" className="text-sm font-medium hover:underline" style={linkStyle}>
          ← Retour au module Auth
        </Link>
        <Link href="/modules/auth/documentation" className="text-sm font-medium hover:underline" style={linkStyle}>
          Documentation →
        </Link>
      </nav>
    </div>
  );
}
