"use client";

import React from "react";
import { Card, Divider, Skeleton } from "@/components/bpm";

export interface FicheSkeletonProps {
  /** Nombre de cartes de section (défaut 3). */
  sections?: number;
  /** Afficher une ligne type métriques + bouton. */
  withMetrics?: boolean;
  /** Afficher un bloc formulaire (card outlined). */
  withForm?: boolean;
  /** Afficher un bloc liste. */
  withList?: boolean;
  /** Afficher un bloc SLA (fiche ticket). */
  withSla?: boolean;
  /** Une seule section (ex. contrat). */
  singleSection?: boolean;
  className?: string;
}

function SkeletonSectionCard({ rows = 4 }: { rows?: number }) {
  return (
    <Card variant="elevated" className="mt-4">
      <div className="bpm-card-body p-4">
        <Skeleton variant="rectangular" width="60%" height={22} className="mb-3" rounded="md" />
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <React.Fragment key={i}>
              <dt><Skeleton variant="text" width="80%" height={12} className="rounded-sm" /></dt>
              <dd><Skeleton variant="text" width={i % 2 === 0 ? "70%" : "90%"} height={14} className="rounded-sm" /></dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </Card>
  );
}

export function FicheSkeleton({
  sections = 3,
  withMetrics = false,
  withForm = false,
  withList = false,
  withSla = false,
  singleSection = false,
  className = "",
}: FicheSkeletonProps) {
  return (
    <div className={`doc-page ${className}`.trim()} role="status" aria-busy="true" aria-live="polite" aria-label="Chargement de la fiche">
      <Card variant="elevated">
        <div className="bpm-card-body p-4">
          <Skeleton variant="text" width="75%" height={14} className="mb-2" />
          <Skeleton variant="rectangular" width="70%" height={32} className="mb-2" rounded="md" />
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton variant="rectangular" width={72} height={22} rounded="md" />
            <Skeleton variant="rectangular" width={88} height={22} rounded="md" />
            <Skeleton variant="rectangular" width={96} height={22} rounded="md" />
          </div>
        </div>
      </Card>
      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />

      {withSla && (
        <Card variant="elevated" className="mt-4">
          <div className="bpm-card-body p-4">
            <Skeleton variant="rectangular" width={120} height={22} className="mb-3" rounded="md" />
            <Skeleton variant="text" width="100%" height={10} className="mb-2" />
            <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full mb-2" />
            <Skeleton variant="rectangular" width={90} height={20} rounded="md" />
          </div>
        </Card>
      )}

      {singleSection ? (
        <Card variant="outlined" className="mt-4">
          <div className="bpm-card-body p-4">
            <Skeleton variant="rectangular" width="50%" height={24} className="mb-4" rounded="md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <React.Fragment key={i}>
                  <dt><Skeleton variant="text" width="40%" height={12} /></dt>
                  <dd><Skeleton variant="text" width="70%" height={14} /></dd>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4">
              <Skeleton variant="rectangular" width={120} height={40} rounded="md" />
            </div>
          </div>
        </Card>
      ) : (
        <>
          {Array.from({ length: sections }).map((_, i) => (
            <SkeletonSectionCard key={i} rows={i === 0 ? 5 : 4} />
          ))}
          {withMetrics && (
            <Card variant="elevated" className="mt-4">
              <div className="bpm-card-body p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <Skeleton variant="rectangular" width={100} height={36} rounded="md" />
                  <Skeleton variant="rectangular" width={160} height={32} rounded="md" />
                </div>
              </div>
            </Card>
          )}
          {withList && (
            <Card variant="elevated" className="mt-4">
              <div className="bpm-card-body p-4">
                <Skeleton variant="rectangular" width="45%" height={22} className="mb-4" rounded="md" />
                <ul className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex flex-wrap gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0">
                      <Skeleton variant="rectangular" width={80} height={14} rounded="sm" />
                      <Skeleton variant="text" width="40%" height={14} />
                      <Skeleton variant="rectangular" width={60} height={18} rounded="md" />
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
          {withForm && (
            <Card variant="outlined" className="mt-4">
              <div className="bpm-card-body p-4">
                <Skeleton variant="rectangular" width="55%" height={22} className="mb-4" rounded="md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton variant="rectangular" width="100%" height={40} rounded="md" />
                  <Skeleton variant="rectangular" width="100%" height={80} rounded="md" />
                </div>
                <div className="mt-4">
                  <Skeleton variant="rectangular" width={120} height={40} rounded="md" />
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      <nav className="mt-8 flex flex-wrap gap-3">
        <Skeleton variant="rectangular" width={180} height={40} rounded="md" />
        <Skeleton variant="rectangular" width={140} height={40} rounded="md" />
      </nav>
    </div>
  );
}
