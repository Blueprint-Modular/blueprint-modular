import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto" style={{ color: "var(--bpm-text-primary)", background: "var(--bpm-bg-primary)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>Terms &amp; Conditions</h1>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Contenu à compléter. En utilisant Blueprint Modular, vous acceptez les conditions d’utilisation du service.
      </p>
      <Link href="/login" className="underline" style={{ color: "var(--bpm-accent)" }}>Retour à la connexion</Link>
    </main>
  );
}
