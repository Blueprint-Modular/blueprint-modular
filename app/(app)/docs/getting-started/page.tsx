"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/bpm/CodeBlock";
import { Button } from "@/components/bpm/Button";
import { Metric } from "@/components/bpm/Metric";

const STEPS = [
  { id: 1, title: "Cas d'usage", key: "use-case" },
  { id: 2, title: "Installation", key: "install" },
  { id: 3, title: "Premier composant", key: "first" },
];

const USE_CASES = [
  { id: "dashboard", label: "Dashboard de reporting" },
  { id: "app", label: "Application métier" },
  { id: "wiki", label: "Wiki" },
  { id: "docs", label: "Analyse de documents" },
];

export default function GettingStartedPage() {
  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState<string>("dashboard");

  const installCode = `pip install blueprint-modular
bpm init --name mon-app
cd mon-app
bpm run app.py`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Démarrage</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              background: step === s.id ? "var(--bpm-accent)" : "var(--bpm-bg-secondary)",
              color: step === s.id ? "#fff" : "var(--bpm-text-primary)",
              borderColor: step === s.id ? "var(--bpm-accent)" : "var(--bpm-border)",
            }}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {step === 1 && (
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
            Choisis ton cas d&apos;usage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {USE_CASES.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUseCase(u.id)}
                className="p-4 rounded-lg border text-left transition-colors"
                style={{
                  borderColor: useCase === u.id ? "var(--bpm-accent)" : "var(--bpm-border)",
                  background: useCase === u.id ? "var(--bpm-accent-light)" : "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                {u.label}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={() => setStep(2)}>Suivant : Installation</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Installation</h2>
          <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Code adapté au cas &quot;{USE_CASES.find((u) => u.id === useCase)?.label ?? useCase}&quot;. Copie en un clic.
          </p>
          <CodeBlock code={installCode} />
          <div className="mt-6 flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline">
              Précédent
            </Button>
            <Button onClick={() => setStep(3)}>Suivant : Premier composant</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Ton premier composant</h2>
          <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Aperçu en direct :
          </p>
          <div
            className="p-6 rounded-lg border mb-6"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
          >
            <Metric label="CA mensuel" value="142 500" delta={3200} />
          </div>
          <CodeBlock code={`import bpm\nbpm.metric("CA mensuel", 142500, delta=3200)`} />
          <div className="mt-6">
            <Button onClick={() => setStep(2)} variant="outline">
              Précédent
            </Button>
          </div>
        </section>
      )}

      <p className="mt-8 text-sm">
        <Link
          href="/docs"
          className="hover:underline"
          style={{ color: "var(--bpm-accent-cyan)", textDecoration: "none" }}
        >
          Retour à la documentation
        </Link>
      </p>
    </div>
  );
}
