import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blueprint Modular",
    short_name: "BPM",
    description: "App Blueprint Modular — Wiki, modules, sandbox, paramètres.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#1a4b8f",
    lang: "fr",
    icons: [
      {
        src: "/img/logo-bpm-nom.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/img/logo-bpm-nom.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
