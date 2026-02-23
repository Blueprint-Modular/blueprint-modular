"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocSidebarPage() {
  const { prev, next } = getPrevNext("sidebar");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.sidebar
        </div>
        <h1>bpm.sidebar</h1>
        <p className="doc-description">
          Décorateur qui enregistre une fonction comme contenu de la barre latérale. La fonction peut appeler d&apos;autres composants BPM (liens, titres, boutons, etc.) pour constituer le contenu de la sidebar.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Navigation</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Usage
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Décorez une fonction avec <code>@bpm.sidebar</code>. Lors de l&apos;exécution de l&apos;app (<code>bpm run app.py</code>), le moteur de rendu peut récupérer cette fonction via <code>bpm.get_registered(&quot;sidebar&quot;)</code> et afficher son contenu dans une colonne latérale.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Exemples
      </h2>
      <CodeBlock
        code={`@bpm.sidebar
def my_sidebar():
    bpm.title("Menu", level=3)
    bpm.write("Accueil")
    bpm.write("Paramètres")
    bpm.button("Déconnexion")`}
        language="python"
      />
      <CodeBlock
        code={`# Enregistrement : la fonction est appelée au chargement de l'app
# Le layout (CLI / frontend) utilise bpm.get_registered("sidebar") pour
# récupérer la fonction et afficher ses nœuds dans la barre latérale.`}
        language="python"
      />

      <table className="props-table mt-6">
        <thead>
          <tr>
            <th>Élément</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>@bpm.sidebar</code></td>
            <td>Décorateur à appliquer à une fonction sans arguments. La fonction est enregistrée sous le nom &quot;sidebar&quot;.</td>
          </tr>
          <tr>
            <td><code>bpm.get_registered(&quot;sidebar&quot;)</code></td>
            <td>Retourne la fonction enregistrée (ou <code>None</code>). Le moteur de rendu l&apos;appelle pour obtenir les nœuds à afficher dans la sidebar.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration layout
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Le CLI BPM (<code>bpm run app.py</code>) et les frontends qui consomment les nœuds peuvent vérifier la présence d&apos;une sidebar enregistrée et générer une mise en page à deux colonnes : sidebar (contenu de la fonction décorée) + zone principale (contenu du script).
      </p>

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
