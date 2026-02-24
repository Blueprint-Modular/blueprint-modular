"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function AuthModulePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="doc-page">
        <div className="doc-page-header">
          <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → bpm.auth</div>
          <h1>bpm.auth</h1>
          <p className="doc-description">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → bpm.auth</div>
        <h1>bpm.auth</h1>
        <p className="doc-description">
          Gestion de la session et de la connexion (Google ou e-mail). Whitelist et protection des routes.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module auth utilise NextAuth (providers Google, credentials). La session est disponible dans toute l&apos;app ; les pages protégées redirigent vers la page de connexion si l&apos;utilisateur n&apos;est pas connecté.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3" style={{ color: "var(--bpm-text-primary)" }}>Modèles de page de connexion</h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        L&apos;app utilise le <strong>modèle split</strong> (formulaire à gauche, visuel à droite). Trois variantes sont documentées ci-dessous.
      </p>
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        <div
          className="p-4 rounded-xl border overflow-hidden"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            1. Modèle split (actuel)
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Layout en deux panneaux : à gauche le formulaire (connexion ou création de compte), à droite une image de fond (équipe, collaboration) avec overlay type carte de réunion.
          </p>
          <div className="rounded-lg border mb-3 overflow-hidden" style={{ borderColor: "var(--bpm-border)", aspectRatio: "16/10" }}>
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
              alt="Exemple visuel : équipe en collaboration (Unsplash)"
              width={400}
              height={250}
              className="w-full h-full object-cover"
            />
          </div>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>Composants <code className="text-xs">LoginPage</code>, <code className="text-xs">RegisterPage</code>, <code className="text-xs">AuthSplitLayout</code></li>
            <li>Styles partagés <code className="text-xs">AuthForm.module.css</code></li>
            <li><strong>/login</strong> et <strong>/register</strong>, footer Sign in / Terms &amp; Conditions</li>
          </ul>
          <div className="flex gap-2 flex-wrap">
            <Link href="/login" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>Connexion</Link>
            <Link href="/register" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>Inscription</Link>
          </div>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            2. Modèle carte centrée (historique)
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Carte centrée, titre + sous-titre, choix E-mail ou Google, formulaire email avec Retour / Se connecter, footer avec lien accueil et Connexion. Non utilisé dans cette version.
          </p>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>Même composant <code className="text-xs">LoginPage</code> sans <code className="text-xs">AuthSplitLayout</code></li>
            <li>Styles <code className="text-xs">AuthForm.module.css</code></li>
          </ul>
          <Link href="/login" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
            Aperçu login
          </Link>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: "var(--bpm-text-primary)", fontSize: "1rem" }}>
            3. Modèle minimal (Google seul)
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Une seule option : bouton « Se connecter avec Google », titre court et lien « Retour à l&apos;accueil ». Idéal pour les apps qui n&apos;utilisent que OAuth.
          </p>
          <ul className="text-xs mb-3 pl-4 list-disc" style={{ color: "var(--bpm-text-secondary)" }}>
            <li>Pas de formulaire e-mail / mot de passe</li>
            <li>Même composant <code className="text-xs">LoginPage</code> avec <code className="text-xs">showEmailOption=false</code></li>
            <li>Page épurée, un seul call-to-action</li>
          </ul>
          <span className="text-sm block mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Disponible en passant <code className="text-xs">showEmailOption=false</code>
          </span>
          <Link
            href="/login?showEmailOption=false"
            className="text-sm font-medium"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Aperçu
          </Link>
        </div>
      </div>

      {session?.user ? (
        <div
          className="max-w-md p-6 rounded-xl border"
          style={{
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
            Session active
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                style={{ background: "var(--bpm-accent)" }}
              >
                {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                {session.user.name ?? "Utilisateur"}
              </p>
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
