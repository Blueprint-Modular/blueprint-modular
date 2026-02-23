import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProviders } from "@/components/NotificationProviders";
import { ChunkLoadHandler } from "@/components/ChunkLoadHandler";
import { PwaSwRegister } from "@/components/PwaSwRegister";

export const metadata: Metadata = {
  title: "Blueprint Modular",
  description:
    "Briques Python/React pour vos interfaces métier. Sans HTML ni JavaScript.",
  manifest: "/manifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a4b8f" },
    { media: "(prefers-color-scheme: dark)", color: "#1a4b8f" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BPM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/img/logo-bpm-nom.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('bpm-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');var a=localStorage.getItem('bpm-accent-color');if(a&&/^#[0-9A-Fa-f]{6}$/.test(a))document.documentElement.style.setProperty('--bpm-accent',a);})();`,
          }}
        />
      </head>
      <body>
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
