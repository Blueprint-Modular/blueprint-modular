"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VeilleSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/veille");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers le module Veille…
    </p>
  );
}
