"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type DemoPeriod = "7d" | "30d" | "90d";

function parsePeriod(s: string | null): DemoPeriod {
  if (s === "7d" || s === "30d" || s === "90d") return s;
  return "30d";
}

type DemoPeriodContextValue = {
  period: DemoPeriod;
  setPeriod: (p: DemoPeriod) => void;
};

const DemoPeriodContext = createContext<DemoPeriodContextValue | null>(null);

export function useDemoPeriod() {
  const ctx = useContext(DemoPeriodContext);
  if (!ctx) throw new Error("useDemoPeriod must be used within DemoPeriodProvider");
  return ctx;
}

export function DemoPeriodProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periodFromUrl = parsePeriod(searchParams.get("period"));
  const [period, setPeriodState] = useState<DemoPeriod>(periodFromUrl);

  useEffect(() => {
    setPeriodState(periodFromUrl);
  }, [periodFromUrl]);

  const setPeriod = useCallback(
    (p: DemoPeriod) => {
      setPeriodState(p);
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", p);
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return (
    <DemoPeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </DemoPeriodContext.Provider>
  );
}
