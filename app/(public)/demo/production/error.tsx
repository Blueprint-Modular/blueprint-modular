"use client";

import Link from "next/link";

export default function DemoProductionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center px-4"
      style={{ background: "var(--bpm-bg-secondary, #f5f5f5)" }}
    >
      <div
        className="rounded-lg border p-6 max-w-md w-full text-center"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <h2 className="text-lg font-semibold mb-2">Démo indisponible</h2>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Le serveur n&apos;a pas pu charger les données. Vérifiez la base de données ou réessayez plus tard.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
