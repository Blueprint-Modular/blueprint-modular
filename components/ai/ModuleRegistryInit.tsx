"use client";

import { useEffect } from "react";
import { moduleRegistry } from "@/lib/ai/module-registry";

/**
 * Enregistre les modules Wiki et Documents dans le registry pour l'assistant IA.
 * Monté une fois dans le layout app.
 */
export function ModuleRegistryInit() {
  useEffect(() => {
    moduleRegistry.register("wiki", {
      label: "Wiki",
      tags: ["wiki", "documentation", "connaissance"],
      description: "Articles du wiki interne (guides, procédures). Contenu des articles récents inclus pour que l'assistant puisse s'appuyer sur le texte.",
      getData: async () => {
        try {
          const res = await fetch("/api/wiki?withContent=true&limit=15");
          if (!res.ok) return { raw: "Wiki : non disponible." };
          const articles = (await res.json()) as { title: string; slug: string; content?: string }[];
          const dataframes = [
            { label: "Articles récents", rows: articles.slice(0, 20).map((a) => ({ titre: a.title, slug: a.slug })) },
          ];
          const raw = articles
            .filter((a) => a.content != null && a.content.trim().length > 0)
            .map((a) => `## ${a.title} (${a.slug})\n${(a.content ?? "").trim()}`)
            .join("\n\n");
          return { dataframes, raw: raw || "Aucun contenu d'article disponible." };
        } catch {
          return { raw: "Wiki : erreur de chargement." };
        }
      },
    });

    moduleRegistry.register("documents", {
      label: "Documents",
      tags: ["documents", "contrats", "analyse"],
      description: "Documents uploadés et analysés (contrats, métadonnées).",
      getData: async () => {
        try {
          const res = await fetch("/api/documents");
          if (!res.ok) return { raw: "Documents : non disponible." };
          const docs = (await res.json()) as { filename: string; analysisStatus: string; supplier?: string }[];
          return {
            dataframes: [
              {
                label: "Documents",
                rows: docs.slice(0, 20).map((d) => ({
                  fichier: d.filename,
                  statut: d.analysisStatus,
                  fournisseur: d.supplier ?? "-",
                })),
              },
            ],
          };
        } catch {
          return { raw: "Documents : erreur de chargement." };
        }
      },
    });

    return () => {
      moduleRegistry.unregister("wiki");
      moduleRegistry.unregister("documents");
    };
  }, []);
  return null;
}
