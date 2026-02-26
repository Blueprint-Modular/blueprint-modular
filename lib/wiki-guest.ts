/**
 * Mode invité du Wiki : 3 articles de base (hors cache) + articles créés en invité stockés en localStorage.
 * Permet de tester le wiki sans connexion.
 */

export const WIKI_GUEST_STORAGE_KEY = "bpm_wiki_guest_articles";

export type GuestWikiArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  isPublished: boolean;
  updatedAt: string;
  author?: { name: string | null };
  authorId?: string;
  canEdit?: boolean;
  children?: GuestWikiArticle[];
  tags?: string[];
};

/** 3 articles de base (non stockés en cache, toujours visibles en mode invité). */
export const WIKI_BASE_ARTICLES: GuestWikiArticle[] = [
  {
    id: "base-accueil",
    title: "Accueil",
    slug: "accueil",
    content: "Bienvenue dans le wiki. En mode invité, vous pouvez créer des articles ; ils sont enregistrés localement dans votre navigateur.\n\nLes 3 articles de base (Accueil, Guide, FAQ) sont en lecture seule.",
    parentId: null,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    author: { name: "Wiki" },
    canEdit: false,
  },
  {
    id: "base-guide",
    title: "Guide",
    slug: "guide",
    content: "## Guide rapide\n\n- **Créer un article** : cliquez sur « Nouvel article ».\n- **Modifier** : ouvrez un article puis « Modifier » (articles invité uniquement).\n- Les articles que vous créez en mode invité sont sauvegardés dans le cache du navigateur.",
    parentId: null,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    author: { name: "Wiki" },
    canEdit: false,
  },
  {
    id: "base-faq",
    title: "FAQ",
    slug: "faq",
    content: "## FAQ\n\n**Le wiki est-il sauvegardé ?**\nEn mode invité, vos articles sont stockés dans le cache du navigateur (localStorage). Connectez-vous pour les enregistrer en base.",
    parentId: null,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    author: { name: "Wiki" },
    canEdit: false,
  },
];

function getStored(): GuestWikiArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WIKI_GUEST_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function setStored(articles: GuestWikiArticle[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WIKI_GUEST_STORAGE_KEY, JSON.stringify(articles));
  } catch {
    // ignore
  }
}

/** Tous les articles en mode invité : base + cache. */
export function getGuestWikiArticles(): GuestWikiArticle[] {
  const cached = getStored().map((a) => ({ ...a, canEdit: true }));
  return [...WIKI_BASE_ARTICLES.map((a) => ({ ...a, canEdit: false })), ...cached];
}

/** Récupérer un article par slug (base ou cache). */
export function getGuestArticleBySlug(slug: string): GuestWikiArticle | null {
  const base = WIKI_BASE_ARTICLES.find((a) => a.slug === slug);
  if (base) return { ...base, canEdit: false };
  const cached = getStored().find((a) => a.slug === slug);
  return cached ? { ...cached, canEdit: true } : null;
}

/** Ajouter un article en cache invité. */
export function addGuestArticle(article: Omit<GuestWikiArticle, "id" | "updatedAt">): GuestWikiArticle {
  const id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const full: GuestWikiArticle = {
    ...article,
    id,
    updatedAt: now,
    canEdit: true,
  };
  const list = getStored();
  if (list.some((a) => a.slug === full.slug)) {
    throw new Error("Un article avec ce slug existe déjà");
  }
  list.push(full);
  setStored(list);
  return full;
}

/** Mettre à jour un article en cache (invité uniquement, pas les base). */
export function updateGuestArticle(slug: string, patch: Partial<Pick<GuestWikiArticle, "title" | "content" | "isPublished">>): GuestWikiArticle | null {
  if (WIKI_BASE_ARTICLES.some((a) => a.slug === slug)) return null;
  const list = getStored();
  const idx = list.findIndex((a) => a.slug === slug);
  if (idx === -1) return null;
  const updated = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  setStored(list);
  return updated;
}

/** Supprimer un article du cache (invité uniquement). */
export function deleteGuestArticle(slug: string): boolean {
  if (WIKI_BASE_ARTICLES.some((a) => a.slug === slug)) return false;
  const list = getStored().filter((a) => a.slug !== slug);
  setStored(list);
  return true;
}
