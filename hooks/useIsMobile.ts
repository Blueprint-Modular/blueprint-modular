"use client";

import { useState, useEffect } from "react";

const DEFAULT_BREAKPOINT = 768;

/**
 * Retourne true si le viewport est en dessous du breakpoint (mobile/PWA).
 * Utilisé pour désactiver le min-width des tableaux sur mobile (scroll horizontal confiné au wrapper).
 * @param maxWidth breakpoint en px (défaut 768, aligné sur Tailwind md)
 */
export function useIsMobile(maxWidth: number = DEFAULT_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const set = () => setIsMobile(mql.matches);
    set();
    mql.addEventListener("change", set);
    return () => mql.removeEventListener("change", set);
  }, [maxWidth]);

  return isMobile;
}
