"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthSplitLayout } from "./AuthSplitLayout";
import styles from "./AuthForm.module.css";

type RegisterPageProps = {
  title?: string;
  logoSrc?: string | null;
  callbackUrl?: string | null;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 12 }} aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function RegisterPage({
  title = "Blueprint Modular",
  logoSrc = null,
  callbackUrl = null,
}: RegisterPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleGoogleSignUp = () => {
    setError(null);
    const url = callbackUrl
      ? `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/api/auth/signin/google";
    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.location.href = data.redirectUrl ?? "/login";
        return;
      }
      setError((data as { error?: string }).error ?? "Inscription impossible. Utilisez Google pour créer un compte.");
    } catch {
      setError("Erreur réseau. Réessayez ou utilisez Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout ratio="40" rightOverlay={true}>
      <div className={styles.formBlock}>
        {logoSrc && !logoError && (
          <div className={styles.logo}>
            <Image
              src={logoSrc}
              alt=""
              width={120}
              height={48}
              priority
              unoptimized={logoSrc?.startsWith("data:")}
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          Utilisez Google ou Apple pour vous inscrire, ou créez un compte avec votre e-mail.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.methods}>
          <button
            type="button"
            className={`${styles.methodButton} ${styles.methodButtonApple}`}
            onClick={() => setError("Inscription avec Apple bientôt disponible. Utilisez Google.")}
          >
            <AppleIcon />
            Apple
          </button>
          <button
            type="button"
            className={`${styles.methodButton} ${styles.methodButtonGoogle}`}
            onClick={handleGoogleSignUp}
          >
            <GoogleIcon />
            Google
          </button>
        </div>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Dupont"
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={loading}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !email.trim() || !password}
              style={{ flex: "1 1 100%" }}
            >
              {loading ? "Création du compte…" : "Submit"}
            </button>
          </div>
        </form>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/login" className={styles.footerLink}>
              Sign in
            </Link>
            <span className={styles.footerSep}>·</span>
            <Link href="/" className={styles.footerLink}>
              Retour à l’accueil
            </Link>
          </div>
          <p className={styles.terms}>
            En créant un compte, vous acceptez nos{" "}
            <Link href="/terms">Terms &amp; Conditions</Link> et notre{" "}
            <Link href="/privacy">Politique de confidentialité</Link>.
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  );
}
