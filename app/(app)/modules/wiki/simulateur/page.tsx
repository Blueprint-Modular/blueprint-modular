"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/bpm";

export default function WikiSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/wiki/guide");
  }, [router]);
  return (
    <div className="doc-page flex flex-col items-center justify-center gap-4 min-h-[200px]" style={{ color: "var(--bpm-text-secondary)" }}>
      <Spinner size="medium" text="Redirection vers le Wiki…" />
      <p className="text-sm">Vous allez être redirigé vers l&apos;article Guide du Wiki.</p>
    </div>
  );
}
