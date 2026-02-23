"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type AvatarSize = "small" | "medium" | "large";
type AvatarVariant = "default" | "sidebar";

export default function DocAvatarPage() {
  const [variant, setVariant] = useState<AvatarVariant>("default");
  const [size, setSize] = useState<AvatarSize>("medium");
  const [initials, setInitials] = useState("JD");
  const [name, setName] = useState("Rémi Cabrit");
  const [subtitle, setSubtitle] = useState("remicabrit@gmail.com");
  const [showLogout, setShowLogout] = useState(true);
  const [logoutLabel, setLogoutLabel] = useState("Se déconnecter");

  const { prev, next } = getPrevNext("avatar");

  const parts: string[] = [];
  if (initials.trim()) parts.push(`initials="${initials.trim().replace(/"/g, '\\"')}"`);
  if (size !== "medium") parts.push(`size="${size}"`);
  if (variant === "sidebar") {
    parts.push('variant="sidebar"');
    if (name.trim()) parts.push(`name="${name.trim().replace(/"/g, '\\"')}"`);
    if (subtitle.trim()) parts.push(`subtitle="${subtitle.trim().replace(/"/g, '\\"')}"`);
    if (showLogout) parts.push("on_logout=...");
    if (showLogout && logoutLabel !== "Se déconnecter") parts.push(`logout_label="${logoutLabel.replace(/"/g, '\\"')}"`);
  }
  const pythonCode = `bpm.avatar(${parts.join(", ")})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.avatar
        </div>
        <h1>bpm.avatar</h1>
        <p className="doc-description">
          Avatar utilisateur (initiales ou image). Option <code>variant="sidebar"</code> pour afficher nom, sous-titre et bouton de déconnexion dans une sidebar.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Affichage de données</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="max-w-xs">
            <Avatar
              variant={variant}
              size={size}
              initials={initials.trim() || undefined}
              name={variant === "sidebar" ? (name.trim() || undefined) : undefined}
              subtitle={variant === "sidebar" ? (subtitle.trim() || undefined) : undefined}
              onLogout={variant === "sidebar" && showLogout ? () => {} : undefined}
              logoutLabel={logoutLabel}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as AvatarVariant)}>
              <option value="default">default</option>
              <option value="sidebar">sidebar</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as AvatarSize)}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>initials</label>
            <input
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              placeholder="ex. JD"
            />
          </div>
          {variant === "sidebar" && (
            <>
              <div className="sandbox-control-group">
                <label>name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom"
                />
              </div>
              <div className="sandbox-control-group">
                <label>subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="ex. email"
                />
              </div>
              <div className="sandbox-control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={showLogout}
                    onChange={(e) => setShowLogout(e.target.checked)}
                  />{" "}
                  Afficher bouton déconnexion
                </label>
              </div>
              {showLogout && (
                <div className="sandbox-control-group">
                  <label>logoutLabel</label>
                  <input
                    type="text"
                    value={logoutLabel}
                    onChange={(e) => setLogoutLabel(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              Copier
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props (React)</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>src</code></td>
            <td><code>string | null</code></td>
            <td>—</td>
            <td>URL de l’image (si absent, affiche <code>initials</code>).</td>
          </tr>
          <tr>
            <td><code>alt</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Texte alternatif de l’image.</td>
          </tr>
          <tr>
            <td><code>initials</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Initiales affichées quand pas d’image.</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>small | medium | large</code></td>
            <td>medium</td>
            <td>Taille de l’avatar.</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | sidebar</code></td>
            <td>default</td>
            <td><code>sidebar</code> : bloc avec nom, sous-titre et option déconnexion.</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Nom à côté de l’avatar (variant sidebar).</td>
          </tr>
          <tr>
            <td><code>subtitle</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Sous-titre sous le nom, ex. email (variant sidebar).</td>
          </tr>
          <tr>
            <td><code>onLogout</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>Callback déconnexion ; si fourni, affiche le bouton (variant sidebar).</td>
          </tr>
          <tr>
            <td><code>logoutLabel</code></td>
            <td><code>string</code></td>
            <td>Se déconnecter</td>
            <td>Libellé du bouton de déconnexion.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.avatar(initials="JD", size="medium")\nbpm.avatar(initials="RC", size="large")'} language="python" />
      <CodeBlock code={'# Dans une sidebar\nbpm.avatar(\n    variant="sidebar",\n    initials="RC",\n    name="Rémi Cabrit",\n    subtitle="remi@example.com",\n    on_logout=lambda: ...\n)'} language="python" />

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester en direct dans le sandbox :
        </p>
        <Link href="/sandbox?component=avatar" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
