/**
 * Plugin rehype : transforme #tag dans les nœuds texte en badge cliquable
 * uniquement si le tag existe dans knownTags. N'applique pas dans code, pre, titres, liens (CDC Bug 3).
 */
import { visitParents } from "unist-util-visit-parents";
import type { Root, Text, Element } from "hast";

const SKIP_TAG_NAMES = new Set(["code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "a"]);
const HASHTAG_REGEX = /#([a-zA-Z0-9_\u00C0-\u024F-]+)/g;

function isElement(node: unknown): node is Element {
  return typeof node === "object" && node !== null && (node as Element).type === "element";
}

export function rehypeWikiHashtags(knownTags: string[]) {
  const tagSet = new Set(knownTags.map((t) => t.toLowerCase()));

  return (tree: Root) => {
    const toReplace: { parent: Element; index: number; textNode: Text; newNodes: (Text | Element)[] }[] = [];

    visitParents(tree, "text", (node: Text, ancestors: unknown[]) => {
      for (let i = ancestors.length - 1; i >= 0; i--) {
        const a = ancestors[i];
        if (isElement(a) && a.tagName && SKIP_TAG_NAMES.has(a.tagName.toLowerCase())) return;
      }

      const value = node.value;
      const parts = value.split(HASHTAG_REGEX);
      if (parts.length <= 1) return;

      const newNodes: (Text | Element)[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          if (parts[i]) newNodes.push({ type: "text", value: parts[i] });
        } else {
          const word = parts[i];
          const key = word.toLowerCase();
          if (tagSet.has(key)) {
            newNodes.push({
              type: "element",
              tagName: "a",
              properties: {
                href: `/modules/wiki?tag=${encodeURIComponent(word)}`,
                className: ["bpm-badge", "bpm-badge-default", "inline-block", "text-xs", "font-medium", "px-2", "py-0.5", "rounded-md", "no-underline"],
                style: "background:var(--bpm-bg-secondary);color:var(--bpm-text-primary);border:1px solid var(--bpm-border)",
              },
              children: [{ type: "text", value: word }],
            });
          } else {
            newNodes.push({ type: "text", value: word });
          }
        }
      }

      const parent = ancestors[ancestors.length - 1];
      if (!isElement(parent) || !Array.isArray(parent.children)) return;
      const index = parent.children.indexOf(node as unknown as Element);
      if (index === -1) return;
      toReplace.push({ parent, index, textNode: node, newNodes });
    });

    toReplace.sort((a, b) => (a.parent !== b.parent ? 0 : b.index - a.index));
    for (const { parent, index, newNodes } of toReplace) {
      parent.children.splice(index, 1, ...newNodes);
    }
  };
}
