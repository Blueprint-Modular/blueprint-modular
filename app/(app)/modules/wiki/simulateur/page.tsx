"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WikiSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/wiki");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers le simulateur Wiki…
    </p>
  );
}
