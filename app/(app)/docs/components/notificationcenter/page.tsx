"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationCenter, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import type { NotificationItem } from "@/components/bpm";

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Nouveau message",
    message: "Vous avez reçu un message.",
    timestamp: new Date().toISOString(),
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Tâche terminée",
    message: "Export CSV réussi.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    type: "success",
  },
];

export default function DocNotificationCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [maxVisible, setMaxVisible] = useState(50);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const pyMaxVisible = maxVisible !== 50 ? `, maxVisible=${maxVisible}` : "";
  const pythonCode = `bpm.notificationCenter(notifications=items, onMarkRead=mark_read, onMarkAllRead=mark_all_read${pyMaxVisible})`;
  const { prev, next } = getPrevNext("notificationcenter");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.notificationCenter</div>
        <h1>bpm.notificationCenter</h1>
        <p className="doc-description">Liste de notifications (non lues / lues), marquage lecture et suppression.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
            maxVisible={maxVisible}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>maxVisible</label>
            <input type="number" min={5} max={100} value={maxVisible} onChange={(e) => setMaxVisible(Number(e.target.value) || 50)} />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>notifications</code></td><td><code>NotificationItem[]</code></td><td>—</td><td>Oui</td><td>id, title, message, type, timestamp (ISO), read, actionLabel?, onAction?</td></tr>
          <tr><td><code>onMarkRead</code></td><td><code>(id: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Marquer une notification comme lue.</td></tr>
          <tr><td><code>onMarkAllRead</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Tout marquer comme lu (bouton en-tête).</td></tr>
          <tr><td><code>onDismiss</code></td><td><code>(id: string) =&gt; void</code></td><td>—</td><td>Non</td><td>Supprimer une notification lue (au survol).</td></tr>
          <tr><td><code>maxVisible</code></td><td><code>number</code></td><td>50</td><td>Non</td><td>Nombre max affiché avant « Voir les anciennes ».</td></tr>
          <tr><td><code>emptyMessage</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Message si liste vide.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read)'} language="python" />
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read, onDismiss=dismiss)'} language="python" />
      <CodeBlock code={'bpm.notificationCenter(notifications=notifs, onMarkRead=mark_read, onMarkAllRead=mark_all_read, maxVisible=20)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
