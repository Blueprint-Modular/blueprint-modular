import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto" style={{ color: "var(--bpm-text-primary)", background: "var(--bpm-bg-primary)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>Politique de confidentialité</h1>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Contenu à compléter. Vos données sont traitées conformément au RGPD et à notre politique de confidentialité.
      </p>
      <Link href="/login" className="underline" style={{ color: "var(--bpm-accent)" }}>Retour à la connexion</Link>
    </main>
  );
}
