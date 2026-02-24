"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IASimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/ia");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers le simulateur IA…
    </p>
  );
}
