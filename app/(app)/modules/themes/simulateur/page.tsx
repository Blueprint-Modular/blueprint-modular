"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ThemesSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/themes");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers Thèmes / White-label…
    </p>
  );
}
