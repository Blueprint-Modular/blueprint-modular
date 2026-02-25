"use client";

import Link from "next/link";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";
import { CodeBlock, Tabs } from "@/components/bpm";

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

  const documentationContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        La cloche affiche les notifications récentes (stockées dans le navigateur). Chaque notification a un niveau 1, 2 ou 3 ; le filtre dans <Link href="/settings" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Paramètres → Général</Link> permet de n&apos;afficher que les niveaux suffisamment prioritaires.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Comment implanter le module</h2>
      <p className="mb-3" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Le module repose sur un <strong style={{ color: "var(--bpm-text-primary)" }}>contexte React</strong> et une <strong style={{ color: "var(--bpm-text-primary)" }}>cloche dans le header</strong> déjà intégrée au layout. À faire dans votre app :
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li>Envelopper l&apos;arbre de l&apos;app avec <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>NotificationHistoryProvider</code> (ou utiliser <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>NotificationProviders</code> qui inclut aussi le toast).</li>
        <li>Dans tout composant enfant, utiliser <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>useNotificationHistory()</code> pour obtenir <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>addNotification</code>.</li>
        <li>Appeler <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>addNotification(&#123; message, type?, title?, pageName? &#125;)</code>. Le niveau (1–3) est déduit automatiquement via <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>getNotificationLevel</code> si vous ne le fournissez pas.</li>
      </ul>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Fichiers principaux : <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>contexts/NotificationHistoryContext.tsx</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>lib/notificationLevels.ts</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>components/NotificationBell.tsx</code>.
      </p>
      <div className="mb-6">
        <CodeBlock
          code={`import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

function MyComponent() {
  const { addNotification } = useNotificationHistory();

  const handleSave = () => {
    addNotification({
      message: "Enregistrement réussi.",
      type: "success",
      title: "Sauvegarde",
      pageName: "Mon écran",
    });
    // Niveau déduit automatiquement (ex. 2 pour success)
  };

  const handleError = () => {
    const payload = { message: "Échec.", type: "error" as const, title: "Erreur", pageName: null };
    addNotification({ ...payload, level: getNotificationLevel(payload) });
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}`}
          language="tsx"
        />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Niveaux</h2>
      <ul className="list-disc pl-5 mb-0 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 1</strong> — Haute priorité (ex. erreurs)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 2</strong> — Moyenne (ex. succès, avertissements)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 3</strong> — Basse (ex. info, paramètres sauvegardés)</li>
      </ul>
    </>
  );

  const simulateurContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Tester la cloche</h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Ajoutez une notification de test puis ouvrez la cloche dans le header.
      </p>
      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
        }}
      >
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

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Niveaux</h2>
      <ul className="list-disc pl-5 mb-0 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 1</strong> — Haute priorité (ex. erreurs)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 2</strong> — Moyenne (ex. succès, avertissements)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>Niveau 3</strong> — Basse (ex. info, paramètres sauvegardés)</li>
      </ul>
    </>
  );

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
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/notification/documentation" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Documentation complète (fonctionnement, installation, paramétrage, code) →
          </Link>
          {" · "}
          <Link href="/modules/notification/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Simulateur (tester les notifications)
          </Link>
        </p>
      </div>

      <Tabs
        tabs={[
          { label: "Documentation", content: documentationContent },
          { label: "Simulateur", content: simulateurContent },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
