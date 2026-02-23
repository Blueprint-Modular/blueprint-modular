"use client";

import { useEffect } from "react";

export function PwaSwRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    window.navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => {})
      .catch(() => {});
  }, []);
  return null;
}
