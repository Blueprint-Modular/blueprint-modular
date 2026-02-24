"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocumentsSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/documents");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers le simulateur Analyse de documents…
    </p>
  );
}
