"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormulaireDynamiqueSimulateurPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/formulaire-dynamique");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      Redirection vers Formulaire dynamique…
    </p>
  );
}
