import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProviders } from "@/components/NotificationProviders";
import { ChunkLoadHandler } from "@/components/ChunkLoadHandler";
import { PwaSwRegister } from "@/components/PwaSwRegister";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.blueprint-modular.com";
const DEFAULT_DESC = "Briques Python/React pour vos interfaces métier. Sans HTML ni JavaScript.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "Blueprint Modular", template: "%s — Blueprint Modular" },
  description: DEFAULT_DESC,
  applicationName: "Blueprint Modular",
  manifest: "/manifest",
  // Favicon : app/icon.svg (convention Next.js, lien injecté automatiquement)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BPM" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Blueprint Modular",
    title: "Blueprint Modular",
    description: DEFAULT_DESC,
    url: BASE_URL,
    images: [{ url: "/img/og-cover.png", width: 1200, height: 630, alt: "Blueprint Modular" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blueprint Modular",
    description: DEFAULT_DESC,
    images: ["/img/og-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#00a3e2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('bpm-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');var a=localStorage.getItem('bpm-accent-color');if(a&&/^#[0-9A-Fa-f]{6}$/.test(a))document.documentElement.style.setProperty('--bpm-accent',a);})();`,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Blueprint Modular",
              description: DEFAULT_DESC,
              url: BASE_URL,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              inLanguage: "fr",
            }),
          }}
        />
        <a href="#main-content" className="skip-nav">Aller au contenu principal</a>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProviders>
              <ChunkLoadHandler />
              <PwaSwRegister />
              {children}
            </NotificationProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
