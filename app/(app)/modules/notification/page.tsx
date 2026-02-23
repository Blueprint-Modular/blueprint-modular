"use client";

import Link from "next/link";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

export default function NotificationModulePage() {
  const { addNotification } = useNotificationHistory();

  const addTestNotification = (type: "info" | "success" | "warning" | "error") => {
    const payload = {
      message: `Notification de test (${type}) depuis le module bpm.notification.`,
      type,
      title: "Test",
      pageName: "Module Notification",
    };
    const level = getNotificationLevel(payload);
    addNotification({ ...payload, level });
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → bpm.notification</div>
        <h1>bpm.notification</h1>
        <p className="doc-description">
          Historique des notifications, cloche dans le header, niveaux 1 (haute) à 3 (basse). Le niveau minimal affiché est configurable dans Paramètres → Général.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        La cloche affiche les notifications récentes (stockées dans le navigateur). Chaque notification a un niveau 1, 2 ou 3 ; le filtre dans <Link href="/settings" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Paramètres → Général</Link> permet de n&apos;afficher que les niveaux suffisamment prioritaires.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Tester la cloche</h2>
      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Ajoutez une notification de test puis ouvrez la cloche dans le header.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addTestNotification("info")}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
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
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
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
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
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
            className="px-3 py-2 rounded-lg text-sm font-medium border transition"
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

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Niveaux</h2>
      <ul className="list-disc pl-5 mb-6 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 1</strong> — Haute priorité (ex. erreurs)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 2</strong> — Moyenne (ex. succès, avertissements)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 3</strong> — Basse (ex. info, paramètres sauvegardés)</li>
      </ul>
    </div>
  );
}
