"use client";

import React, { useState } from "react";

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
  const list = notifications.slice(0, maxVisible);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
            borderRadius: 8,
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
      {open && (
        <>
          <div
            role="presentation"
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="bpm-notification-center-popup"
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
                padding: "16px 20px",
                borderBottom: "1px solid var(--bpm-border)",
                background: "var(--bpm-bg-secondary)",
                fontWeight: 600,
                fontSize: "var(--bpm-font-size-lg)",
                color: "var(--bpm-text)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "var(--bpm-font-size-lg)", color: "var(--bpm-text)", margin: 0 }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => { onReadAll(); }}
                  style={{
                    padding: "4px 8px",
                    fontSize: "var(--bpm-font-size-base)",
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
                        padding: "8px 16px",
                        fontSize: "var(--bpm-font-size-sm)",
                        fontWeight: 600,
                        color: "var(--bpm-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {group}
                    </div>
                    {items.map((n) => (
                      <div
                        key={n.id}
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
                        <div
                          style={{
                            fontWeight: n.read ? 400 : 600,
                            fontSize: "var(--bpm-font-size-base)",
                            color: "var(--bpm-text)",
                          }}
                        >
                          {n.title}
                        </div>
                        {n.message && (
                          <div
                            style={{
                              fontSize: "var(--bpm-font-size-sm)",
                              color: "var(--bpm-text-muted)",
                              marginTop: 4,
                            }}
                          >
                            {n.message}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "var(--bpm-font-size-sm)",
                            color: "var(--bpm-text-muted)",
                            marginTop: 4,
                          }}
                        >
                          {n.timestamp.toLocaleString("fr-FR")}
                        </div>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                            style={{
                              marginTop: 8,
                              padding: "2px 8px",
                              fontSize: "var(--bpm-font-size-sm)",
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
                    ))}
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
