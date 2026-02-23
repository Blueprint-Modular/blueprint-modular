"use client";

import React, { useState, createContext, useContext } from "react";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";
import "./Toast.css";

type ToastItem = {
  id: number;
  message: string;
  type: string;
  title: string | null;
  pageName: string | null;
  pageIcon: string | null;
};

type ToastContextValue = {
  showToast: (
    message: string,
    type?: string,
    duration?: number,
    title?: string | null,
    pageName?: string | null,
    pageIcon?: string | null,
    level?: number | null
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { addNotification } = useNotificationHistory();

  const showToast = (
    message: string,
    type = "info",
    duration = 5000,
    title: string | null = null,
    pageName: string | null = null,
    pageIcon: string | null = null,
    level: number | null = null
  ) => {
    setToasts((prev) => {
      const isDuplicate = prev.some(
        (t) => t.message === message && t.type === type && t.title === title && t.pageName === pageName
      );
      if (isDuplicate) return prev;

      const id = Date.now();
      const notificationLevel = level ?? getNotificationLevel({ type, title, pageName, message });
      addNotification({ message, type, title, pageName, pageIcon, level: notificationLevel });

      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, duration);

      return [...prev, { id, message, type, title, pageName, pageIcon }];
    });
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="bpm-toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function Toast({
  message,
  type,
  title,
  pageName,
  pageIcon,
  onClose,
}: ToastItem & { onClose: () => void }) {
  return (
    <div className={`bpm-toast bpm-toast-${type}`}>
      <div className="bpm-toast-content">
        {pageName && (
          <div className="bpm-toast-page-header">
            {pageIcon && (
              <span className="bpm-toast-page-icon" dangerouslySetInnerHTML={{ __html: pageIcon }} />
            )}
            <span className="bpm-toast-page-name">{pageName}</span>
          </div>
        )}
        {title && (
          <div className="bpm-toast-header">
            <span className="bpm-toast-title">{title}</span>
          </div>
        )}
        <span className="bpm-toast-message">{message}</span>
      </div>
      <button
        type="button"
        className="bpm-toast-close"
        onClick={onClose}
        aria-label="Fermer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1" }}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
