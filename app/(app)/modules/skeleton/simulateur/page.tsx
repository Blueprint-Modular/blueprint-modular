"use client";

import React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/bpm";

/**
 * Assemblage de bpm.skeleton pour simuler le chargement d'une page complète :
 * header (fil d'Ariane + avatar), titre + description, métriques, zone contenu, tableau.
 */
export default function SkeletonSimulateurPage() {
  return (
    <div className="doc-page" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="doc-breadcrumb">
        <Link href="/modules">Modules</Link> → <Link href="/modules/skeleton">Skeleton</Link> → Simulateur
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Chargement de page (skeleton)</h1>
        <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
          Assemblage de <code>bpm.skeleton</code> pour un état de chargement réaliste. À réutiliser ou adapter.
        </p>
      </div>

      {/* ========== Skeleton : page complète ========== */}
      <div
        className="rounded-xl border p-6"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
        aria-busy
        aria-label="Chargement"
      >
        {/* Header (barre type app) */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton variant="text" width="40%" height={14} />
          </div>
          <Skeleton variant="circular" width={36} height={36} />
        </div>

        {/* Titre + description */}
        <div className="mb-6">
          <Skeleton variant="rectangular" width="55%" height={28} className="mb-3" />
          <Skeleton variant="text" width="90%" height={12} className="mb-2" />
          <Skeleton variant="text" width="70%" height={12} />
        </div>

        {/* Ligne de métriques (3 blocs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Skeleton variant="rectangular" width="100%" height={72} className="rounded-lg" />
          <Skeleton variant="rectangular" width="100%" height={72} className="rounded-lg" />
          <Skeleton variant="rectangular" width="100%" height={72} className="rounded-lg" />
        </div>

        {/* Zone contenu : carte + liste ou 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <Skeleton variant="rectangular" width="100%" height={24} className="mb-3 rounded" />
            <Skeleton variant="text" width="100%" height={12} className="mb-2" />
            <Skeleton variant="text" width="95%" height={12} className="mb-2" />
            <Skeleton variant="text" width="88%" height={12} />
          </div>
          <div>
            <Skeleton variant="rectangular" width="100%" height={20} className="mb-2 rounded" />
            <Skeleton variant="text" width="100%" height={10} className="mb-2" />
            <Skeleton variant="text" width="90%" height={10} className="mb-2" />
            <Skeleton variant="text" width="70%" height={10} />
          </div>
        </div>

        {/* Tableau (en-tête + lignes) */}
        <div>
          <div className="flex gap-4 mb-3 pb-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
            <Skeleton variant="rectangular" width={120} height={16} className="rounded" />
            <Skeleton variant="rectangular" width={160} height={16} className="rounded" />
            <Skeleton variant="rectangular" width={100} height={16} className="rounded" />
            <Skeleton variant="rectangular" width={80} height={16} className="rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 py-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
              <Skeleton variant="rectangular" width={120} height={14} className="rounded" />
              <Skeleton variant="rectangular" width={160} height={14} className="rounded" />
              <Skeleton variant="rectangular" width={100} height={14} className="rounded" />
              <Skeleton variant="rectangular" width={80} height={14} className="rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
