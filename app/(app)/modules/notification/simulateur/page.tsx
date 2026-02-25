"use client";

import Link from "next/link";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

const cardStyle = {
  background: "var(--bpm-bg-secondary)",
  borderColor: "var(--bpm-border)",
};
const linkStyle = { color: "var(--bpm-accent-cyan)" };

export default function NotificationSimulateurPage() {
  const { addNotification } = useNotificationHistory();

  const addTestNotification = (type: "info" | "success" | "warning" | "error") => {
    const payload = {
      message: `Notification de test (${type}) depuis le simulateur bpm.notification.`,
      type,
      title: "Test",
      pageName: "Simulateur Notification",
    };
    const level = getNotificationLevel(payload);
    addNotification({ ...payload, level });
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/notification">Notification</Link>
          {" → "}
          Simulateur
        </div>
        <h1>Simulateur — Notification</h1>
        <p className="doc-description">
          Testez les notifications : ajoutez des notifications de test (info, succès, avertissement, erreur) puis ouvrez la cloche dans le header.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Tester la cloche
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Cliquez sur un bouton pour ajouter une notification de test. Ouvrez ensuite la cloche dans le header pour voir l&apos;historique. Le filtre d&apos;affichage (niveau minimum) se configure dans{" "}
        <Link href="/settings" className="font-medium underline" style={linkStyle}>
          Paramètres → Général
        </Link>
        .
      </p>
      <div className="p-6 rounded-xl border mb-8" style={cardStyle}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addTestNotification("info")}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Info
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("success")}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Succès
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("warning")}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Avertissement
          </button>
          <button
            type="button"
            onClick={() => addTestNotification("error")}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-90"
            style={{
              color: "var(--bpm-text-primary)",
              background: "var(--bpm-bg-primary)",
              borderColor: "var(--bpm-border)",
            }}
          >
            Erreur
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Niveaux
      </h2>
      <ul className="list-disc pl-6 mb-8 space-y-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 1</strong> — Haute priorité (ex. erreurs)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 2</strong> — Moyenne (ex. succès, avertissements)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 3</strong> — Basse (ex. info, paramètres sauvegardés)</li>
      </ul>

      <nav className="doc-pagination">
        <Link href="/modules/notification" className="text-sm font-medium hover:underline" style={linkStyle}>
          ← Retour au module Notification
        </Link>
        <Link href="/modules/notification/documentation" className="text-sm font-medium hover:underline" style={linkStyle}>
          Documentation →
        </Link>
      </nav>
    </div>
  );
}
