"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Textarea, Spinner, Chip } from "@/components/bpm";

/** Icônes conformes à la charte Blueprint (stroke, couleur accent) */
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)" }} aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)" }} aria-hidden>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/** Auteur structuré (P2) */
type Author = { id: string; displayName: string; avatar?: string | null };

/** Commentaire enrichi (P1) */
type Comment = {
  id: string;
  entityId?: string;
  entityType?: string;
  parentId?: string | null;
  type?: "commentaire" | "annotation" | "décision" | "blocage";
  author: Author;
  date: string; // ISO
  content: string;
  resolved?: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  editedAt?: string | null;
  attachments?: { url: string; name?: string }[];
};

const COMMENT_TYPES: Record<Comment["type"] & string, { label: string; color: string }> = {
  commentaire: { label: "Commentaire", color: "var(--bpm-text-secondary)" },
  annotation: { label: "Annotation", color: "var(--bpm-accent-cyan)" },
  décision: { label: "Décision", color: "#27ae60" },
  blocage: { label: "Blocage", color: "#e74c3c" },
};

/** Chip de type dont la couleur sélectionnée = couleur d’affichage dans le fil */
function TypeChip({
  label,
  selected,
  color,
  onClick,
}: { label: string; selected: boolean; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border-0"
      style={{
        background: selected ? color : "var(--bpm-sidebar-bg)",
        color: selected ? "#fff" : "var(--bpm-text-primary)",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Couleur dérivée de l'id auteur (P5) */
const AVATAR_COLORS = ["var(--bpm-accent-cyan)", "#e67e22", "#27ae60", "#9b59b6", "#e74c3c", "#1abc9c"];
function authorColor(authorId: string): string {
  let h = 0;
  for (let i = 0; i < authorId.length; i++) h = (h << 5) - h + authorId.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (displayName.slice(0, 2) || "?").toUpperCase();
}

/** Format date lisible + tooltip ISO (P7) */
function formatCommentDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 24 * 60 * 60 * 1000 && diffMs >= 0) {
    const h = Math.floor(diffMs / (60 * 60 * 1000));
    const m = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    if (h === 0) return m <= 1 ? "À l'instant" : `Il y a ${m} min`;
    return `Il y a ${h}h`;
  }
  const months = "janv.,févr.,mars,avr.,mai,juin,juil.,août,sept.,oct.,nov.,déc.".split(",");
  const day = d.getDate();
  const month = months[d.getMonth()];
  const time = `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  return `${day} ${month} à ${time}`;
}

const PAGE_SIZE = 20;

/** Fil de démo enrichi (P18) : 12 commentaires, types variés, une réponse, un résolu */
function buildDemoComments(currentUserId: string, currentUserDisplayName: string): Comment[] {
  const alice: Author = { id: "alice", displayName: "Alice Martin" };
  const bob: Author = { id: "bob", displayName: "Bob Leroy" };
  const current: Author = { id: currentUserId, displayName: currentUserDisplayName };
  const base = "2025-02-20T";
  return [
    { id: "1", author: alice, date: `${base}09:00:00`, content: "Bonne avancée sur le livrable. On peut valider la partie 1.", type: "commentaire" },
    { id: "2", author: bob, date: `${base}10:15:00`, content: "Merci, je finalise la doc ce soir.", type: "commentaire" },
    { id: "3", author: alice, date: `${base}11:30:00`, content: "Point d'attention : la section 3.2 doit être revue avant merge.", type: "annotation" },
    { id: "4", author: bob, date: `${base}14:00:00`, content: "Section 3.2 corrigée. Voir commit a1b2c3.", type: "commentaire", parentId: "3" },
    { id: "5", author: alice, date: `${base}15:00:00`, content: "Décision : on livre la v1 le 28 février.", type: "décision", resolved: true, resolvedAt: `${base}15:05:00`, resolvedBy: "alice" },
    { id: "6", author: bob, date: `${base}16:00:00`, content: "Blocage potentiel : l'API externe ne répond pas sur le préprod.", type: "blocage" },
    { id: "7", author: current, date: `${base}16:30:00`, content: "J'ai ouvert un ticket chez le fournisseur. On bascule sur le mock en attendant.", type: "commentaire" },
    { id: "8", author: alice, date: `${base}17:00:00`, content: "OK, on documente le contournement dans le runbook.", type: "commentaire" },
    { id: "9", author: bob, date: "2025-02-21T09:00:00", content: "Réunion de suivi à 10h pour faire le point.", type: "commentaire" },
    { id: "10", author: alice, date: "2025-02-21T09:45:00", content: "Présent.", type: "commentaire" },
    { id: "11", author: current, date: "2025-02-21T09:50:00", content: "Présent aussi.", type: "commentaire" },
    { id: "12", author: bob, date: "2025-02-21T10:00:00", content: "Merci à tous, on clos ce fil.", type: "commentaire" },
    { id: "13", author: alice, date: "2025-02-22T09:00:00", content: "Rappel : revue de code demain 10h.", type: "commentaire" },
    { id: "14", author: bob, date: "2025-02-22T09:05:00", content: "OK pour moi.", type: "commentaire" },
    { id: "15", author: alice, date: "2025-02-22T11:00:00", content: "Annotation : ligne 45, typo à corriger.", type: "annotation" },
    { id: "16", author: bob, date: "2025-02-22T11:30:00", content: "Corrigé.", type: "commentaire", parentId: "15" },
    { id: "17", author: alice, date: "2025-02-22T14:00:00", content: "Décision : on garde l'ancienne API en fallback jusqu'au 15 mars.", type: "décision" },
    { id: "18", author: bob, date: "2025-02-22T14:10:00", content: "Noté.", type: "commentaire" },
    { id: "19", author: current, date: "2025-02-22T15:00:00", content: "Je m'occupe de la doc technique.", type: "commentaire" },
    { id: "20", author: alice, date: "2025-02-22T16:00:00", content: "Parfait.", type: "commentaire" },
    { id: "21", author: bob, date: "2025-02-23T09:00:00", content: "Dernier point : qui valide la release ?", type: "commentaire" },
    { id: "22", author: alice, date: "2025-02-23T09:15:00", content: "Moi pour la partie métier, Bob pour la technique.", type: "décision" },
  ];
}

export default function CommentairesSimulateurPage() {
  const currentUserId = "current-user";
  const currentUserDisplayName = "Marie Dupont";
  const listRef = useRef<HTMLDivElement>(null);
  const lastCommentRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<Comment[]>(() => buildDemoComments(currentUserId, currentUserDisplayName));
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newCommentType, setNewCommentType] = useState<Comment["type"]>("commentaire");
  const [filterType, setFilterType] = useState<Comment["type"] | null>(null);

  const trimmed = newComment.trim();
  const canSend = trimmed.length > 0 && !sending;

  const filteredComments = filterType ? comments.filter((c) => c.type === filterType) : comments;
  const displayedComments = filteredComments.slice(-visibleCount);
  const hasMore = filteredComments.length > visibleCount;
  const olderCount = filteredComments.length - visibleCount;

  const handleSend = useCallback(async () => {
    const content = newComment.trim();
    if (!content || sending) return;
    setError(null);
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const c: Comment = {
        id: `new-${Date.now()}`,
        author: { id: currentUserId, displayName: currentUserDisplayName },
        date: new Date().toISOString(),
        content,
        type: newCommentType,
      };
      setComments((prev) => [...prev, c]);
      setNewComment("");
      setVisibleCount((n) => Math.max(n, comments.length + 1));
      requestAnimationFrame(() => lastCommentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch {
      setError("Erreur d'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  }, [newComment, sending, comments.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setEditingId(null);
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      setComments((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, content: editContent.trim(), editedAt: new Date().toISOString() } : c))
      );
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: currentUserId } : c
      )
    );
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">Commentaires</Link> → Simulateur
        </div>
        <h1>Simulateur — Commentaires</h1>
        <p className="doc-description">
          Fil de commentaires avec avatars, types, résolution, actions au survol et zone de saisie multi-lignes.
        </p>
      </div>

      {/* Contexte entité (P3) */}
      <div
        className="rounded-t-xl border border-b-0 px-3 py-2 text-sm"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)", color: "var(--bpm-text-secondary)" }}
      >
        Document : <Link href="#" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Rapport Q4 — Synthèse</Link>
      </div>

      {/* Conteneur épuré sans Panel (demande utilisateur) */}
      <div
        className="rounded-b-xl overflow-hidden border px-4 py-3"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        {/* En-tête avec compteur (P8) — pas d'icône ℹ */}
        <h2 className="text-base font-semibold m-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
          Commentaires ({comments.length})
          {filterType && (
            <span className="font-normal text-sm ml-2" style={{ color: "var(--bpm-text-secondary)" }}>
              — Filtre : {COMMENT_TYPES[filterType]?.label ?? filterType} ({filteredComments.length})
            </span>
          )}
        </h2>

        {/* Filtre par type — couleurs alignées avec le fil */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--bpm-text-secondary)" }}>Filtrer :</span>
          <TypeChip label="Tous" selected={filterType === null} color="var(--bpm-accent)" onClick={() => setFilterType(null)} />
          {(Object.keys(COMMENT_TYPES) as (keyof typeof COMMENT_TYPES)[]).map((t) => (
            <TypeChip key={t} label={COMMENT_TYPES[t].label} selected={filterType === t} color={COMMENT_TYPES[t].color} onClick={() => setFilterType(t)} />
          ))}
        </div>

        {/* Pagination (P16) */}
        {hasMore && (
          <div className="mb-3">
            <Button size="small" variant="secondary" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
              Voir les {Math.min(PAGE_SIZE, olderCount)} commentaires précédents
            </Button>
          </div>
        )}

        {/* Fil de commentaires */}
        <div ref={listRef} className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
          {displayedComments.map((c) => {
            const isOwn = c.author.id === currentUserId;
            const isEditing = editingId === c.id;
            return (
              <div
                key={c.id}
                ref={displayedComments[displayedComments.length - 1]?.id === c.id ? lastCommentRef : undefined}
                className="group relative flex gap-3 p-3 rounded-lg border transition-colors"
                style={{
                  borderColor: "var(--bpm-border)",
                  background: isOwn ? "rgba(0,163,226,0.06)" : "var(--bpm-sidebar-bg)",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                  style={{ background: authorColor(c.author.id), color: "#fff" }}
                  aria-hidden
                >
                  {getInitials(c.author.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>
                      {c.author.displayName}
                      {isOwn && <span className="font-normal text-xs ml-1 opacity-80">(vous)</span>}
                    </strong>
                    <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }} title={c.date}>
                      {formatCommentDate(c.date)}
                    </span>
                    {c.type && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bpm-bg-primary)", color: COMMENT_TYPES[c.type]?.color ?? undefined }}>
                        {COMMENT_TYPES[c.type]?.label ?? c.type}
                      </span>
                    )}
                    {c.resolved && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#27ae6022", color: "#27ae60" }}>Résolu</span>
                    )}
                    {c.editedAt && <span className="text-xs opacity-70">(modifié)</span>}
                  </div>
                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bpm-textarea w-full px-2 py-1.5 rounded-lg border text-sm resize-y"
                        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-1">
                        <Button size="small" onClick={handleSaveEdit}>Enregistrer</Button>
                        <Button size="small" variant="secondary" onClick={() => { setEditingId(null); setEditContent(""); }}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="m-0 mt-1 text-sm" style={{ color: "var(--bpm-text-primary)", whiteSpace: "pre-wrap" }}>{c.content}</p>
                  )}
                </div>
                {/* Actions au survol (P12) */}
                {!isEditing && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {isOwn && (
                      <>
                        <button type="button" onClick={() => handleEdit(c.id, c.content)} className="p-1 rounded hover:bg-black/10 flex items-center justify-center" title="Modifier" aria-label="Modifier">
                          <IconEdit />
                        </button>
                        <button type="button" onClick={() => handleDelete(c.id)} className="p-1 rounded hover:bg-black/10 flex items-center justify-center" title="Supprimer" aria-label="Supprimer">
                          <IconTrash />
                        </button>
                      </>
                    )}
                    {!c.resolved && (c.type === "décision" || c.type === "blocage" || c.type === "annotation") && (
                      <button type="button" onClick={() => handleResolve(c.id)} className="p-1 rounded hover:bg-black/10 flex items-center justify-center" title="Marquer résolu" aria-label="Marquer résolu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)" }} aria-hidden>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Séparateur (P10) */}
        <div className="border-t pt-3 mt-2" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Nouveau commentaire</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium shrink-0" style={{ color: "var(--bpm-text-secondary)" }}>Type :</span>
            {(Object.keys(COMMENT_TYPES) as (keyof typeof COMMENT_TYPES)[]).map((t) => (
              <TypeChip
                key={t}
                label={COMMENT_TYPES[t].label}
                selected={newCommentType === t}
                color={COMMENT_TYPES[t].color}
                onClick={() => setNewCommentType(t)}
              />
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Votre message… (Ctrl+Entrée pour envoyer)"
              value={newComment}
              onChange={setNewComment}
              onKeyDown={handleKeyDown}
              rows={2}
              className="flex-1 min-h-[60px] resize-y"
              disabled={sending}
            />
            <div style={{ alignSelf: "flex-end", minWidth: 88 }}>
              <Button size="small" onClick={handleSend} disabled={!canSend}>
                {sending ? <> <Spinner size="small" /> Envoi…</> : "Envoyer"}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-sm mt-2 flex items-center gap-2" style={{ color: "#e74c3c" }}>
              {error}
              <Button size="small" variant="secondary" onClick={() => { setError(null); handleSend(); }}>Réessayer</Button>
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Commentaires</Link>
      </p>
    </div>
  );
}
