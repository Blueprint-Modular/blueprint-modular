"use client";

import { useState } from "react";
import Link from "next/link";
import { Stepper, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocStepperPage() {
  const [stepsStr, setStepsStr] = useState("Informations, Paiement, Confirmation");
  const [currentStep, setCurrentStep] = useState(0);

  const stepLabels = stepsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const steps = stepLabels.length
    ? stepLabels.map((label) => ({ label }))
    : [{ label: "Étape 1" }, { label: "Étape 2" }, { label: "Étape 3" }];
  const maxStep = Math.max(0, steps.length - 1);
  const stepIndex = Math.min(currentStep, maxStep);

  const parts: string[] = [];
  if (steps.length) {
    const stepsArg = steps.map((s) => `{"label": "${s.label.replace(/"/g, '\\"')}"}`).join(", ");
    parts.push(`steps=[${stepsArg}]`);
  }
  if (stepIndex !== 0) parts.push(`current_step=${stepIndex}`);
  const pythonCode = parts.length ? `bpm.stepper(${parts.join(", ")})` : "bpm.stepper()";
  const { prev, next } = getPrevNext("stepper");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.stepper
        </div>
        <h1>bpm.stepper</h1>
        <p className="doc-description">
          Stepper : liste d&apos;étapes avec indicateur d&apos;avancement (étape courante, complétées).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Navigation</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-sm">
            <Stepper
              steps={steps}
              currentStep={stepIndex}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>steps (labels séparés par des virgules)</label>
            <input
              type="text"
              value={stepsStr}
              onChange={(e) => setStepsStr(e.target.value)}
              placeholder="Étape 1, Étape 2, Étape 3"
            />
          </div>
          <div className="sandbox-control-group">
            <label>currentStep (index 0 à {maxStep})</label>
            <input
              type="number"
              min={0}
              max={maxStep}
              value={currentStep}
              onChange={(e) => setCurrentStep(Math.min(maxStep, Math.max(0, Number(e.target.value) || 0)))}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>steps</code></td><td><code>&#123; id?, label, optional?, content? &#125;[]</code></td><td>[]</td><td>Non</td><td>Liste des étapes (<code>label</code> requis).</td></tr>
          <tr><td><code>currentStep</code></td><td><code>number</code></td><td>0</td><td>Non</td><td>Index de l&apos;étape courante (0-based).</td></tr>
          <tr><td><code>onStepClick</code></td><td><code>(index: number) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au clic sur une étape (optionnel).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.stepper(steps=[{"label": "Infos"}, {"label": "Paiement"}, {"label": "Confirmation"}])'} language="python" />
      <CodeBlock code={'bpm.stepper(steps=[{"label": "A"}, {"label": "B"}], current_step=1)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
