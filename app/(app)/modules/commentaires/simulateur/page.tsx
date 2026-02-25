"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Input, Button } from "@/components/bpm";

type Comment = { author: string; date: string; content: string };

const initialComments: Comment[] = [
  { author: "Alice", date: "25/02 10h", content: "Bonne avancée sur le livrable." },
  { author: "Bob", date: "25/02 14h", content: "Merci, je finalise la doc." },
];

export default function CommentairesSimulateurPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleSend = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")} ${now.getHours()}h${String(now.getMinutes()).padStart(2, "0")}`;
    setComments((prev) => [...prev, { author: "Vous", date: dateStr, content: trimmed }]);
    setNewComment("");
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">Commentaires</Link> → Simulateur
        </div>
        <h1>Simulateur — Commentaires</h1>
        <p className="doc-description">
          Fil de commentaires de démo : ajoutez un commentaire avec le champ ci-dessous.
        </p>
      </div>

      <Panel variant="info" title="Commentaires">
        <div className="space-y-3 text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          {comments.map((c, i) => (
            <div
              key={i}
              className="p-2 rounded"
              style={{ background: "var(--bpm-bg-primary)", border: "1px solid var(--bpm-border)" }}
            >
              <strong style={{ color: "var(--bpm-text-primary)" }}>{c.author}</strong>
              <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>— {c.date}</span>
              <p className="m-0 mt-1" style={{ color: "var(--bpm-text-primary)" }}>{c.content}</p>
            </div>
          ))}
        </div>
        <Input
          label="Ajouter un commentaire"
          placeholder="Votre message..."
          value={newComment}
          onChange={(v) => setNewComment(v)}
        />
        <Button size="small" className="mt-2" onClick={handleSend}>
          Envoyer
        </Button>
      </Panel>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Commentaires</Link>
      </p>
    </div>
  );
}
