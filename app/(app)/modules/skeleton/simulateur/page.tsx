"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Skeleton, Slider, Selectbox } from "@/components/bpm";

const ASSEMBLY_OPTIONS = [
  { value: "dashboard", label: "bpm.skeleton_dashboard" },
  { value: "list", label: "bpm.skeleton_list" },
  { value: "article", label: "bpm.skeleton_article" },
  { value: "form", label: "bpm.skeleton_form" },
  { value: "detail", label: "bpm.skeleton_detail" },
  { value: "chart", label: "bpm.skeleton_chart" },
];

function SkeletonDashboard({ metrics = 3, rows = 5 }: { metrics?: number; rows?: number }) {
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="flex items-center justify-between gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="circular" width={36} height={36} />
      </div>
      <div className="mb-6">
        <Skeleton variant="rectangular" width="55%" height={28} className="mb-3" />
        <Skeleton variant="text" width="90%" height={12} className="mb-2" />
        <Skeleton variant="text" width="70%" height={12} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(metrics, 4)}, minmax(0, 1fr))` }}>
        {Array.from({ length: metrics }, (_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={72} rounded="lg" />
        ))}
      </div>
      <div className="mb-6">
        <Skeleton variant="rectangular" width="100%" height={24} className="mb-3" />
        <Skeleton variant="text" width="100%" height={12} className="mb-2" />
        <Skeleton variant="text" width="95%" height={12} />
      </div>
      <div>
        <div className="flex gap-4 mb-3 pb-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
          <Skeleton variant="rectangular" width={120} height={16} />
          <Skeleton variant="rectangular" width={160} height={16} />
          <Skeleton variant="rectangular" width={100} height={16} />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-4 py-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
            <Skeleton variant="rectangular" width={120} height={14} />
            <Skeleton variant="rectangular" width={160} height={14} />
            <Skeleton variant="rectangular" width={100} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonList({ rows = 8, columns = 4 }: { rows?: number; columns?: number }) {
  const cols = Math.min(Math.max(columns, 1), 6);
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="flex items-center justify-between gap-4 mb-4 pb-3" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="rectangular" width="30%" height={20} />
        <Skeleton variant="rectangular" width={200} height={36} rounded="md" />
      </div>
      <Skeleton variant="rectangular" width="100%" height={40} className="mb-4" rounded="md" />
      <div className="flex gap-4 mb-3 pb-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} variant="rectangular" width={i === 0 ? 80 : 100} height={16} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 py-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} variant="rectangular" width={j === 0 ? 80 : 100} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonArticle() {
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <Skeleton variant="rectangular" width="80%" height={32} className="mb-4" rounded="md" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="95%" height={14} className="mb-2" />
      <Skeleton variant="text" width="88%" height={14} className="mb-4" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="70%" height={14} className="mb-4" />
      <Skeleton variant="rectangular" width="60%" height={20} className="mb-2" rounded="sm" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="90%" height={14} />
    </div>
  );
}

function SkeletonForm({ fields = 5 }: { fields?: number }) {
  const n = Math.min(Math.max(fields, 1), 10);
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6 max-w-md"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <Skeleton variant="rectangular" width="50%" height={24} className="mb-6" rounded="md" />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="mb-4">
          <Skeleton variant="rectangular" width={100} height={14} className="mb-2" rounded="sm" />
          <Skeleton variant="rectangular" width="100%" height={40} rounded="md" />
        </div>
      ))}
      <div className="flex gap-2 mt-6">
        <Skeleton variant="rectangular" width={100} height={36} rounded="md" />
        <Skeleton variant="rectangular" width={80} height={36} rounded="md" />
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="flex items-center justify-between gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="rectangular" width={80} height={32} rounded="md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton variant="rectangular" width="70%" height={28} className="mb-4" rounded="md" />
          <Skeleton variant="text" width="100%" height={14} className="mb-2" />
          <Skeleton variant="text" width="95%" height={14} className="mb-2" />
          <Skeleton variant="text" width="88%" height={14} />
        </div>
        <div className="space-y-3">
          <Skeleton variant="rectangular" width={120} height={16} className="mb-2" rounded="sm" />
          <Skeleton variant="text" width="100%" height={12} className="mb-2" />
          <Skeleton variant="text" width="90%" height={12} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={14} className="mb-2" rounded="sm" />
          <Skeleton variant="text" width="80%" height={12} />
        </div>
      </div>
    </div>
  );
}

function SkeletonChart({ type = "bar" }: { type?: string }) {
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement"
    >
      <Skeleton variant="rectangular" width="40%" height={20} className="mb-4" rounded="md" />
      <div className="flex gap-4 items-end" style={{ height: 200 }}>
        <div className="flex flex-col gap-2 w-8 shrink-0">
          {[100, 80, 60, 40, 20].map((h, i) => (
            <Skeleton key={i} variant="rectangular" width={24} height={14} rounded="sm" />
          ))}
        </div>
        <div className="flex-1 flex items-end gap-2 justify-around pt-2">
          {[60, 90, 45, 70, 85, 55].map((h, i) => (
            <Skeleton key={i} variant="rectangular" width="12%" height={`${h}%`} rounded="md" />
          ))}
        </div>
      </div>
      <div className="flex justify-around mt-2 gap-2">
        {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((label, i) => (
          <Skeleton key={i} variant="rectangular" width={32} height={12} rounded="sm" />
        ))}
      </div>
    </div>
  );
}

export default function SkeletonSimulateurPage() {
  const [assembly, setAssembly] = useState("dashboard");
  const [metrics, setMetrics] = useState(3);
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(4);
  const [formFields, setFormFields] = useState(5);

  const preview =
    assembly === "dashboard" ? (
      <SkeletonDashboard metrics={metrics} rows={rows} />
    ) : assembly === "list" ? (
      <SkeletonList rows={rows} columns={columns} />
    ) : assembly === "article" ? (
      <SkeletonArticle />
    ) : assembly === "form" ? (
      <SkeletonForm fields={formFields} />
    ) : assembly === "detail" ? (
      <SkeletonDetail />
    ) : assembly === "chart" ? (
      <SkeletonChart type="bar" />
    ) : (
      <SkeletonDashboard metrics={metrics} rows={rows} />
    );

  return (
    <div className="doc-page" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/skeleton">Skeleton</Link> → Simulateur
        </div>
        <h1>Simulateur — Skeleton</h1>
        <p className="doc-description">
          Assemblages nommés <code>bpm.skeleton_dashboard</code>, <code>bpm.skeleton_list</code>, <code>bpm.skeleton_article</code>, etc. Modifiez les paramètres pour adapter l’aperçu.
        </p>
      </div>

      <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>Assemblage</label>
        <Selectbox
          options={ASSEMBLY_OPTIONS}
          value={assembly}
          onChange={(v) => setAssembly(v ?? "dashboard")}
          placeholder="Choisir"
        />
        {(assembly === "dashboard" || assembly === "list") && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assembly === "dashboard" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Métriques</label>
                  <Slider value={metrics} min={1} max={6} onChange={setMetrics} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Lignes tableau</label>
                  <Slider value={rows} min={1} max={15} onChange={setRows} />
                </div>
              </>
            )}
            {assembly === "list" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Lignes</label>
                  <Slider value={rows} min={1} max={20} onChange={setRows} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Colonnes</label>
                  <Slider value={columns} min={1} max={6} onChange={setColumns} />
                </div>
              </>
            )}
          </div>
        )}
        {assembly === "form" && (
          <div className="mt-4">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Champs</label>
            <Slider value={formFields} min={1} max={10} onChange={setFormFields} />
          </div>
        )}
      </div>

      {preview}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/skeleton" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Skeleton</Link>
        <Link href="/modules/skeleton/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
