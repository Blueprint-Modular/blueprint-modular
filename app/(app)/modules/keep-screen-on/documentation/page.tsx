"use client";

import Link from "next/link";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Keep screen on</strong> utilise l&apos;API <a href="https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Screen Wake Lock</a> pour empêcher l&apos;écran de s&apos;éteindre ou de passer en veille pendant une présentation, une réunion ou une lecture.
    </p>
    <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Réglage</h3>
    <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      <li><strong>Éteint</strong> : le navigateur ne maintient pas l&apos;écran (comportement par défaut).</li>
      <li><strong>5 min, 15 min, 30 min, 1 h</strong> : l&apos;écran reste allumé pendant la durée choisie ; un compte à rebours s&apos;affiche. À la fin, le maintien est relâché automatiquement.</li>
      <li><strong>Indéfini</strong> : l&apos;écran reste allumé tant que l&apos;onglet est visible et actif (pas de limite de temps).</li>
    </ul>
    <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Visibilité de l&apos;onglet</h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Si vous changez d&apos;onglet ou minimisez le navigateur, le Wake Lock peut être relâché par le navigateur. Lorsque vous revenez sur l&apos;onglet, le module réactive automatiquement le maintien (en mode indéfini ou si la durée choisie n&apos;est pas encore écoulée).
    </p>
    <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Compatibilité</h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      L&apos;API Wake Lock fonctionne uniquement en <strong>HTTPS</strong> (ou localhost) et est supportée par Chrome, Edge et Safari récents. En HTTP ou sur un navigateur non supporté, un message indique que la fonctionnalité n&apos;est pas disponible.
    </p>
    <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      <Link href="/modules/keep-screen-on" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir Keep screen on</Link>
    </p>
  </>
);

export default function KeepScreenOnDocPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>Keep screen on</Link> → Documentation
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Keep screen on — Documentation</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Maintien de l&apos;écran allumé avec durée réglable ou indéfinie.
        </p>
      </div>
      <div className="mt-6" style={{ maxWidth: "60ch" }}>
        {docContent}
      </div>
      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Modules</Link>
        <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>Keep screen on</Link>
      </nav>
    </div>
  );
}
