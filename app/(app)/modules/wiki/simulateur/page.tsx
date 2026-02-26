"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import "highlight.js/styles/github.css";

/** Contenu initial du bac à sable : démo complète des capacités Markdown du module. */
const SANDBOX_INITIAL_CONTENT = `# Titre de niveau 1

## Titre niveau 2

### Titre niveau 3

#### Titre niveau 4

Du **texte en gras**, de l’*italique*, du ~~barré~~ et du \`code inline\`.

> Blockquote : citation ou remarque importante avec bordure gauche colorée.

Liste à puces :
- Premier point
- Deuxième point
- Troisième point

Liste numérotée :
1. Étape un
2. Étape deux
3. Étape trois

Cases à cocher :
- [ ] Tâche non faite
- [x] Tâche faite

[Lien hypertexte](https://docs.blueprint-modular.com) vers la documentation.

---

## Bloc de code (JavaScript)

\`\`\`javascript
function hello(name) {
  return \`Bonjour, \${name} !\`;
}
console.log(hello("Wiki"));
\`\`\`

## Tableau Markdown

| Colonne A | Colonne B | Colonne C |
|-----------|-----------|-----------|
| Cellule 1 | Cellule 2 | Cellule 3 |
| Données   | Données   | Données   |

## Callouts

> **Info**  
> Callout de type information.

> **Succès**  
> Callout succès : opération réussie.

> **Avertissement**  
> Callout avertissement : attention à ce point.

> **Danger**  
> Callout danger : action irréversible.

> **Astuce**  
> Callout astuce : conseil pratique.
`;

const STORAGE_KEY_SANDBOX_TO_NEW = "wiki-sandbox-content";

export default function WikiSimulateurPage() {
  const router = useRouter();
  const [content, setContent] = useState(SANDBOX_INITIAL_CONTENT);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = () => {
    if (typeof window !== "undefined" && window.confirm("Réinitialiser le contenu avec la démo par défaut ?")) {
      setContent(SANDBOX_INITIAL_CONTENT);
    }
  };

  const handleCreateFromContent = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY_SANDBOX_TO_NEW, content);
      } catch {
        // ignore quota
      }
      router.push("/modules/wiki/new");
    }
  };

  return (
    <div className="doc-page">
      <nav className="doc-breadcrumb mb-4">
        <Link href="/modules">Modules</Link>
        {" → "}
        <Link href="/modules/wiki">Wiki</Link>
        {" → Simulateur"}
      </nav>

      <div
        className="mb-4 py-3 px-4 rounded-lg border flex items-center justify-between flex-wrap gap-2"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
          color: "var(--bpm-text-secondary)",
        }}
        role="status"
        aria-live="polite"
      >
        <span className="text-sm font-medium">
          Bac à sable — Vos modifications ne sont pas sauvegardées.
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="small" onClick={handleReset} aria-label="Réinitialiser le contenu">
            Réinitialiser
          </Button>
          <Button variant="primary" size="small" onClick={handleCreateFromContent} aria-label="Créer un article depuis ce contenu">
            Créer un article depuis ce contenu
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--bpm-text-primary)" }}>
        Simulateur — Éditeur Markdown
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Éditeur en mode split-view : modifiez le Markdown à gauche, le rendu s&apos;affiche à droite. Titres, listes, tableaux, code, callouts et liens sont supportés.
      </p>

      <div
        className="grid gap-4 rounded-lg border overflow-hidden grid-cols-1 lg:grid-cols-2"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        {/* Colonne gauche : éditeur */}
        <div className="flex flex-col min-h-0 lg:border-r" style={{ borderColor: "var(--bpm-border)" }}>
          <div className="shrink-0 p-2 border-b" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <WikiEditorToolbar
              textareaRef={contentTextareaRef}
              value={content}
              onChange={setContent}
            />
          </div>
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[480px] p-4 font-mono text-sm resize-none border-0 rounded-none w-full"
            style={{
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
            }}
            placeholder="Contenu Markdown..."
            aria-label="Zone d’édition Markdown"
          />
        </div>

        {/* Colonne droite : prévisualisation */}
        <div className="flex flex-col min-h-0 overflow-auto">
          <div
            className="p-4 min-h-[480px] prose prose-sm max-w-none wiki-sandbox-preview"
            style={{
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {content || "*Aucun contenu.*"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Ce contenu n&apos;est pas enregistré en base. Utilisez « Créer un article depuis ce contenu » pour ouvrir la page de création d&apos;article avec ce texte pré-rempli.
      </p>
    </div>
  );
}
