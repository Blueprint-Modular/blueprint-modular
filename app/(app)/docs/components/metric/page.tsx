"use client";

import { useState } from "react";
import Link from "next/link";
import { Metric, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type DeltaType = "aucun" | "normal" | "inverse";

type ValueLocaleOption = "fr-FR" | "en-US" | "de-DE";

export default function DocMetricPage() {
  const [label, setLabel] = useState("Chiffre d'affaires");
  const [value, setValue] = useState(142500);
  const [delta, setDelta] = useState<number | null>(-500);
  const [name, setName] = useState("");
  const [deltaType, setDeltaType] = useState<DeltaType>("normal");
  const [currency, setCurrency] = useState("EUR");
  const [valueLocale, setValueLocale] = useState<ValueLocaleOption>("fr-FR");
  const [valueDecimals, setValueDecimals] = useState(0);
  const [valueGrouping, setValueGrouping] = useState(true);

  const escapedLabel = label.replace(/"/g, '\\"');
  const pyDelta = delta ?? "None";
  const pyName = name.trim() ? `, name="${name.trim().replace(/"/g, '\\"')}"` : "";
  const pyDeltaType = deltaType !== "normal" ? `, deltaType="${deltaType}"` : "";
  const pyCurrency = currency === "" ? `, currency=""` : currency !== "EUR" ? `, currency="${currency.replace(/"/g, '\\"')}"` : "";
  const pyValueLocale = valueLocale !== "fr-FR" ? `, valueLocale="${valueLocale}"` : "";
  const pyValueDecimals = valueDecimals !== 0 ? `, valueDecimals=${valueDecimals}` : "";
  const pyValueGrouping = !valueGrouping ? `, valueGrouping=False` : "";
  const pythonCode = `bpm.metric(label="${escapedLabel}", value=${value}, delta=${pyDelta}${pyName}${pyDeltaType}${pyCurrency}${pyValueLocale}${pyValueDecimals}${pyValueGrouping})`;
  const { prev, next } = getPrevNext("metric");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.metric</div>
        <h1>bpm.metric</h1>
        <p className="doc-description">Affiche une métrique avec valeur, label et delta optionnel (évolution).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Metric
            label={label}
            value={value}
            delta={delta ?? undefined}
            name={name.trim() || undefined}
            deltaType={deltaType}
            currency={currency}
            valueLocale={valueLocale}
            valueDecimals={valueDecimals}
            valueGrouping={valueGrouping}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>delta (optionnel)</label>
            <input
              type="number"
              value={delta ?? ""}
              onChange={(e) => setDelta(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="vide = pas de delta"
            />
          </div>
          <div className="sandbox-control-group">
            <label>name (pour $metric:… ou @)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. ca — référence IA"
            />
          </div>
          <div className="sandbox-control-group">
            <label>deltaType</label>
            <select value={deltaType} onChange={(e) => setDeltaType(e.target.value as DeltaType)}>
              <option value="aucun">aucun</option>
              <option value="normal">normal</option>
              <option value="inverse">inverse</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>Unité</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="">Aucune</option>
              <option value="%">% (pourcentage)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueLocale</label>
            <select value={valueLocale} onChange={(e) => setValueLocale(e.target.value as ValueLocaleOption)}>
              <option value="fr-FR">fr-FR (1 000,50)</option>
              <option value="en-US">en-US (1,000.50)</option>
              <option value="de-DE">de-DE (1.000,50)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueDecimals</label>
            <input
              type="number"
              min={0}
              max={10}
              value={valueDecimals}
              onChange={(e) => setValueDecimals(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>valueGrouping</label>
            <select value={valueGrouping ? "true" : "false"} onChange={(e) => setValueGrouping(e.target.value === "true")}>
              <option value="true">true (1 000,50)</option>
              <option value="false">false (1000,50)</option>
            </select>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Libellé de la métrique.</td></tr>
          <tr><td><code>value</code></td><td><code>string | number</code></td><td>—</td><td>Oui</td><td>Valeur affichée.</td></tr>
          <tr><td><code>delta</code></td><td><code>number | null</code></td><td>—</td><td>Non</td><td>Évolution (+ / -).</td></tr>
          <tr><td><code>deltaType</code></td><td><code>aucun | normal | inverse</code></td><td>normal</td><td>Non</td><td>Interprétation du delta (aucun = pas de couleur).</td></tr>
          <tr><td><code>name</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Nom pour référencer la métrique dans le chat IA (<code>$metric:name</code> ou <code>@name</code>).</td></tr>
          <tr><td><code>currency</code></td><td><code>string</code></td><td>EUR</td><td>Non</td><td>Unité pour le delta (vide = aucune, &quot;%&quot; = pourcentage, EUR, USD, …).</td></tr>
          <tr><td><code>valueLocale</code></td><td><code>string</code></td><td>fr-FR</td><td>Non</td><td>Locale pour formater value et delta (ex. fr-FR → 1 000,50, en-US → 1,000.50).</td></tr>
          <tr><td><code>valueDecimals</code></td><td><code>number</code></td><td>0</td><td>Non</td><td>Nombre de décimales pour la valeur.</td></tr>
          <tr><td><code>valueGrouping</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Séparateur de milliers (false = 1000,50 sans espace).</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.metric("CA", 142500, delta=3200)\nbpm.metric("NPS", 72, delta=-3)'} language="python" />
      <CodeBlock code={'bpm.metric("Chiffre d\'affaires", 142500, delta=-500, name="ca")  # référençable en IA via $metric:ca ou @ca'} language="python" />
      <CodeBlock code={'bpm.metric("Taux", "98%", delta=2)'} language="python" />
      <CodeBlock code={'bpm.metric("Coût", 1500, delta=-100, deltaType="inverse")'} language="python" />
      <CodeBlock code={'bpm.metric("CA", 142500.5, valueLocale="en-US", valueDecimals=2)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
