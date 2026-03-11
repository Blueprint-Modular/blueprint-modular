"use client";

import React, { useState, useEffect } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onDelete?: (id: string) => void;
  maxVisible?: number;
  /** Élément déclencheur (bouton cloche par défaut). */
  trigger?: React.ReactNode;
  className?: string;
}

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" style={{ color: "var(--bpm-text-secondary)" }} aria-hidden>
    <path d="M200-209.23v-40h64.62v-316.92q0-78.39 49.61-137.89 49.62-59.5 125.77-74.11V-800q0-16.67 11.64-28.33Q463.28-840 479.91-840t28.36 11.67Q520-816.67 520-800v21.85q76.15 14.61 125.77 74.11 49.61 59.5 49.61 137.89v316.92H760v40H200Zm280-286.15Zm-.14 390.76q-26.71 0-45.59-18.98-18.89-18.98-18.89-45.63h129.24q0 26.85-19.03 45.73-19.02 18.88-45.73 18.88ZM304.62-249.23h350.76v-316.92q0-72.93-51.23-124.16-51.23-51.23-124.15-51.23-72.92 0-124.15 51.23-51.23 51.23-51.23 124.16v316.92Z" />
  </svg>
);

/** Noms d’icônes Material Symbols (Google Fonts), couleur unique #1f1f1f. */
const TYPE_ICON_NAMES: Record<string, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
};

const NOTIFICATION_ICON_COLOR = "#1f1f1f";
const NOTIFICATION_ICON_SIZE = 24;

function NotificationTypeIcon({ type }: { type: "info" | "success" | "warning" | "error" }) {
  const iconName = TYPE_ICON_NAMES[type] ?? TYPE_ICON_NAMES.info;
  return (
    <span
      className="material-symbols-outlined bpm-material-icon"
      role="img"
      aria-hidden
      style={{
        fontFamily: "Material Symbols Outlined",
        fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24",
        fontSize: NOTIFICATION_ICON_SIZE,
        width: NOTIFICATION_ICON_SIZE,
        height: NOTIFICATION_ICON_SIZE,
        minWidth: NOTIFICATION_ICON_SIZE,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        color: NOTIFICATION_ICON_COLOR,
      }}
    >
      {iconName}
    </span>
  );
}

function formatGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Aujourd'hui";
  if (d.getTime() === yesterday.getTime()) return "Hier";
  return "Plus ancien";
}

export function NotificationCenter({
  notifications,
  onRead,
  onReadAll,
  onDelete,
  maxVisible = 50,
  trigger,
  className = "",
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const list = notifications.slice(0, maxVisible);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 140);
    return () => clearTimeout(t);
  }, [closing]);

  const requestClose = () => {
    setClosing(true);
  };

  const byGroup = list.reduce<Record<string, NotificationItem[]>>((acc, n) => {
    const g = formatGroup(n.timestamp);
    if (!acc[g]) acc[g] = [];
    acc[g].push(n);
    return acc;
  }, {});

  const defaultTrigger = (
    <button
      type="button"
      className="bpm-notification-center-trigger"
      style={{
        position: "relative",
        padding: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        flexShrink: 0,
      }}
      aria-label="Notifications"
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span
          className="bpm-notification-center-badge"
          style={{
            position: "absolute",
            top: 2,
            right: 3,
            minWidth: 15,
            padding: "1px 4px",
            borderRadius: "var(--bpm-radius)",
            background: "var(--bpm-error)",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1.4,
            textAlign: "center",
            border: "1px solid white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
            pointerEvents: "none",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div
      className={className ? `bpm-notification-center ${className}`.trim() : "bpm-notification-center"}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div onClick={() => setOpen((o) => !o)}>{trigger ?? defaultTrigger}</div>
      {(open || closing) && (
        <>
          <div
            role="presentation"
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={requestClose}
          />
          <div
            className={`bpm-notification-center-popup ${closing ? "bpm-notification-center-popup--closing" : ""}`.trim()}
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 10,
              zIndex: 9999,
              width: 400,
              maxWidth: "calc(100vw - 40px)",
              maxHeight: 600,
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius)",
              background: "var(--bpm-bg-primary)",
              boxShadow: "var(--bpm-shadow)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="bpm-notification-center-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--bpm-border)",
                background: "var(--bpm-bg-secondary)",
                fontWeight: 600,
                fontSize: "13px",
                color: "var(--bpm-text)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--bpm-text)", margin: 0 }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => { onReadAll(); }}
                  style={{
                    padding: "2px 6px",
                    fontSize: "11px",
                    border: "none",
                    borderRadius: "var(--bpm-radius-sm)",
                    background: "transparent",
                    color: "var(--bpm-text-muted)",
                    cursor: "pointer",
                  }}
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div style={{ overflowY: "auto", flex: 1, minHeight: 0, maxHeight: 500 }}>
              {["Aujourd'hui", "Hier", "Plus ancien"].map((group) => {
                const items = byGroup[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <div
                      style={{
                        padding: "6px 16px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--bpm-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {group}
                    </div>
                    {items.map((n) => {
                      const type = (n.type ?? "info") as "info" | "success" | "warning" | "error";
                      return (
                        <div
                          key={n.id}
                          className={`bpm-notification-item bpm-notification-item--${type}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            onRead(n.id);
                            if (n.link) window.open(n.link, "_self");
                            setOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onRead(n.id);
                              if (n.link) window.open(n.link, "_self");
                              setOpen(false);
                            }
                          }}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--bpm-border)",
                            background: n.read ? "transparent" : "var(--bpm-bg-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                                <NotificationTypeIcon type={type} />
                              </span>
                              <span
                                style={{
                                  fontWeight: n.read ? 500 : 600,
                                  fontSize: "12px",
                                  color: "var(--bpm-text)",
                                  lineHeight: 1.4,
                                }}
                              >
                                {n.title}
                              </span>
                            </div>
                            {n.message && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--bpm-text-muted)",
                                  lineHeight: 1.5,
                                  paddingLeft: 24,
                                }}
                              >
                                {n.message}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: "10px",
                                color: "var(--bpm-text-muted)",
                                opacity: 0.85,
                                paddingLeft: 24,
                                marginTop: 2,
                              }}
                            >
                              {n.timestamp.toLocaleString("fr-FR")}
                            </div>
                          </div>
                          {onDelete && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                              style={{
                                marginTop: 6,
                                padding: "2px 8px",
                                fontSize: "10px",
                                border: "none",
                                borderRadius: "var(--bpm-radius-sm)",
                                background: "transparent",
                                color: "var(--bpm-error)",
                                cursor: "pointer",
                              }}
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {list.length === 0 && (
                <div
                  className="bpm-notification-center-empty"
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                    color: "var(--bpm-text-muted)",
                    fontSize: "var(--bpm-font-size-base)",
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Aucune notification
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
