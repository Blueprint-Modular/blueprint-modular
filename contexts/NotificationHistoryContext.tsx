"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type StoredNotification = {
  id: number;
  timestamp: string;
  message: string;
  type: string;
  title: string | null;
  pageName: string | null;
  pageIcon: string | null;
  level: number;
};

type NotificationHistoryContextValue = {
  notifications: StoredNotification[];
  addNotification: (notification: Partial<StoredNotification> & { message: string }) => void;
  clearHistory: () => void;
  getRecentNotifications: (limit?: number) => StoredNotification[];
  getUnreadCount: () => number;
};

const NotificationHistoryContext = createContext<NotificationHistoryContextValue | null>(null);

function cleanNotification(notif: StoredNotification): StoredNotification {
  let out = { ...notif };
  if (out.pageIcon && typeof out.pageIcon === "string") {
    const t = out.pageIcon.trim();
    if (!t.startsWith("<svg") || !t.includes("</svg>")) out = { ...out, pageIcon: null };
    else if (!t.includes("xmlns") && !t.includes("viewBox") && !t.includes("path")) out = { ...out, pageIcon: null };
  }
  if (out.message && typeof out.message === "string") {
    const t = out.message.trim();
    if (t.startsWith("<svg") && t.includes("</svg>")) out = { ...out, message: "Notification (icône invalide)" };
  }
  return out;
}

export function NotificationHistoryProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<StoredNotification[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("notification_history");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as StoredNotification[];
      return parsed.map(cleanNotification);
    } catch {
      return [];
    }
  });

  const saveToStorage = useCallback((list: StoredNotification[]) => {
    try {
      const cleaned = list.map(cleanNotification);
      localStorage.setItem("notification_history", JSON.stringify(cleaned));
    } catch {
      // ignore
    }
  }, []);

  const addNotification = useCallback(
    (notification: Partial<StoredNotification> & { message: string }) => {
      setNotifications((prev) => {
        const now = Date.now();
        const type = notification.type ?? "info";
        const title = notification.title ?? null;
        const pageName = notification.pageName ?? null;
        const isDuplicate = prev.some((notif) => {
          const timeDiff = now - new Date(notif.timestamp).getTime();
          const isParamSave =
            type === "success" && title === "Paramètre sauvegardé" && pageName === "Paramètres";
          if (isParamSave && timeDiff < 3000) {
            return (
              notif.type === "success" &&
              notif.title === "Paramètre sauvegardé" &&
              notif.pageName === "Paramètres"
            );
          }
          return (
            notif.message === notification.message &&
            notif.type === type &&
            notif.title === title &&
            notif.pageName === pageName &&
            timeDiff < 5000
          );
        });
        if (isDuplicate) return prev;

        const newNotif: StoredNotification = {
          id: now + Math.random(),
          timestamp: new Date().toISOString(),
          message: notification.message,
          type,
          title: notification.title ?? null,
          pageName: notification.pageName ?? null,
          pageIcon: notification.pageIcon ?? null,
          level: notification.level ?? 3,
        };
        const updated = [newNotif, ...prev].slice(0, 100);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const clearHistory = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const getRecentNotifications = useCallback(
    (limit = 10) => notifications.slice(0, limit),
    [notifications]
  );

  const getUnreadCount = useCallback(() => 0, []);

  return (
    <NotificationHistoryContext.Provider
      value={{
        notifications,
        addNotification,
        clearHistory,
        getRecentNotifications,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationHistoryContext.Provider>
  );
}

export function useNotificationHistory(): NotificationHistoryContextValue {
  const ctx = useContext(NotificationHistoryContext);
  if (!ctx) throw new Error("useNotificationHistory must be used within NotificationHistoryProvider");
  return ctx;
}
