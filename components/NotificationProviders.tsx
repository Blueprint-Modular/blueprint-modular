"use client";

import { NotificationHistoryProvider } from "@/contexts/NotificationHistoryContext";
import { ToastProvider } from "@/components/bpm/Toast";

export function NotificationProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationHistoryProvider>
      <ToastProvider>{children}</ToastProvider>
    </NotificationHistoryProvider>
  );
}
