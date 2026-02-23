import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProviders } from "@/components/NotificationProviders";
import { ChunkLoadHandler } from "@/components/ChunkLoadHandler";

export const metadata: Metadata = {
  title: "Blueprint Modular",
  description:
    "Briques Python/React pour vos interfaces métier. Sans HTML ni JavaScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('bpm-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProviders>
              <ChunkLoadHandler />
              {children}
            </NotificationProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
