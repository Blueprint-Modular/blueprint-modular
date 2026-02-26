"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Panel, Input } from "@/components/bpm";

export default function NewsletterParametresPage() {
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  useEffect(() => {
    fetch("/api/newsletter/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.headerImageUrl) setHeaderImageUrl(data.headerImageUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/newsletter/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headerImageUrl: headerImageUrl.trim() || null }),
        credentials: "include",
      });
      if (res.ok) setMessage("saved");
      else setMessage("error");
    } catch {
      setMessage("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="doc-page">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> → Paramètres
        </div>
        <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> → Paramètres
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Photo de header
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          URL de l’image affichée en en-tête de la newsletter (lien public ou chemin relatif).
        </p>
      </div>

      <Panel variant="info" title="Image d'en-tête">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              URL de l’image
            </label>
            <Input
              type="text"
              value={headerImageUrl}
              onChange={setHeaderImageUrl}
              placeholder="https://exemple.com/image.jpg"
              aria-label="URL de l'image de header"
            />
          </div>
          {headerImageUrl.trim() && (
            <div>
              <span className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Aperçu
              </span>
              <div
                className="rounded-lg border overflow-hidden bg-center bg-cover bg-no-repeat"
                style={{
                  borderColor: "var(--bpm-border)",
                  height: 120,
                  backgroundImage: `url(${headerImageUrl.trim()})`,
                }}
                role="img"
                aria-label="Aperçu du header"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {message === "saved" && (
              <span className="text-sm" style={{ color: "var(--bpm-accent-mint)" }}>
                Enregistré.
              </span>
            )}
            {message === "error" && (
              <span className="text-sm" style={{ color: "var(--bpm-accent)" }}>
                Erreur lors de l’enregistrement.
              </span>
            )}
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à la Newsletter
        </Link>
      </nav>
    </div>
  );
}
