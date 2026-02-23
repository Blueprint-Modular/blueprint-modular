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
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Le module auth utilise NextAuth (providers Google, credentials). La session est disponible dans toute l&apos;app ; les pages protégées redirigent vers la page de connexion si l&apos;utilisateur n&apos;est pas connecté.
      </p>

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
      ) : (
        <div
          className="max-w-md p-6 rounded-xl border"
          style={{
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Vous n&apos;êtes pas connecté. Connectez-vous pour accéder à votre session.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white transition"
            style={{ background: "var(--bpm-accent)" }}
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  );
}
