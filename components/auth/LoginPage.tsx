"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import styles from "./LoginPage.module.css";

type LoginPageProps = {
  title?: string;
  subtitle?: string;
  /** Chemin vers l’image du logo (ex. /logo.svg). Si non fourni, le logo n’est pas affiché. */
  logoSrc?: string | null;
  callbackUrl?: string | null;
  showEmailOption?: boolean;
};

export function LoginPage({
  title = "Blueprint Modular",
  subtitle = "Connexion sécurisée",
  logoSrc = null,
  callbackUrl = null,
  showEmailOption = true,
}: LoginPageProps) {
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleGoogleLogin = () => {
    setError(null);
    const url = callbackUrl
      ? `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/api/auth/signin/google";
    window.location.href = url;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: callbackUrl ?? "/dashboard",
      });
      if (res?.error) {
        setError("Email ou mot de passe incorrect, ou accès non autorisé.");
        return;
      }
      if (res?.url) window.location.href = res.url;
    } catch {
      setError("Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {logoSrc && !logoError && (
          <div className={styles.logo}>
            <Image
              src={logoSrc}
              alt=""
              width={120}
              height={80}
              priority
              unoptimized={logoSrc.startsWith("data:")}
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {error && <div className={styles.error}>{error}</div>}

        {!loginMethod && (
          <div className={styles.methods}>
            {showEmailOption && (
              <>
                <button
                  type="button"
                  className={styles.methodButton}
                  onClick={() => setLoginMethod("email")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 12 }}>
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Se connecter avec votre e-mail
                </button>
                <div className={styles.divider}>
                  <span>ou</span>
                </div>
              </>
            )}
            <button
              type="button"
              className={`${styles.methodButton} ${styles.methodButtonGoogle}`}
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Se connecter avec Google
            </button>
          </div>
        )}

        {loginMethod === "email" && (
          <form className={styles.form} onSubmit={handleEmailSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse mail"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="auth-password">Mot de passe</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => {
                  setLoginMethod(null);
                  setEmail("");
                  setPassword("");
                  setError(null);
                }}
                disabled={loading}
              >
                Retour
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading || !email.trim()}>
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </div>
          </form>
        )}
      </div>

      <footer className={styles.footer}>
        <Link href={callbackUrl || "/"} className={styles.footerLink}>
          {callbackUrl ? "Accéder sans se connecter" : "Retour à l'accueil"}
        </Link>
        <span className={styles.footerSep}>•</span>
        <Link href="/login" className={styles.footerLink}>
          Connexion
        </Link>
      </footer>
    </div>
  );
}
