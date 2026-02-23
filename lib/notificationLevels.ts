/**
 * Classement des notifications par niveau (1–3).
 * 1 = haute (erreurs), 2 = moyenne (succès, avertissements), 3 = basse (info).
 */

export type NotificationPayload = {
  type?: string;
  title?: string | null;
  pageName?: string | null;
  message?: string | null;
};

const LEVEL_RULES: { level: 1 | 2 | 3; match: (ctx: NotificationPayload) => boolean }[] = [
  { level: 3, match: ({ title }) => title === "Paramètre sauvegardé" },
  { level: 3, match: ({ pageName, title }) => pageName === "Paramètres" && (title?.includes?.("sauvegardé") ?? false) },
  { level: 3, match: ({ title }) => title === "Avatar sauvegardé" || title === "Avatar supprimé" },
  { level: 3, match: ({ title }) => title === "Logo sauvegardé" || title === "Logo supprimé" },
  { level: 3, match: ({ type }) => type === "info" },
  { level: 2, match: ({ type }) => type === "success" },
  { level: 2, match: ({ type }) => type === "warning" },
  { level: 1, match: ({ type }) => type === "error" },
];

export function getNotificationLevel(params: NotificationPayload): 1 | 2 | 3 {
  const ctx = { type: "info", ...params };
  for (const rule of LEVEL_RULES) {
    try {
      if (rule.match(ctx)) return rule.level;
    } catch {
      // ignore
    }
  }
  return 3;
}

export const NOTIFICATION_LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: "Priorité haute uniquement (erreurs)",
  2: "Priorité haute et moyenne (erreurs + succès)",
  3: "Toutes les notifications",
};
