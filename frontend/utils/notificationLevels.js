/**
 * Classement des notifications par niveau de priorité (1 à 3).
 * Niveau 1 = Priorité haute (erreurs, critiques)
 * Niveau 2 = Priorité moyenne (succès importants, avertissements)
 * Niveau 3 = Priorité basse (informations, paramètres sauvegardés, etc.)
 *
 * L'utilisateur peut configurer le niveau minimum à afficher dans la cloche :
 * - Niveau 1 : uniquement les notifications de niveau 1
 * - Niveau 2 : niveaux 1 et 2
 * - Niveau 3 : toutes les notifications
 */

const LEVEL_RULES = [
  { level: 3, match: ({ title }) => title === 'Paramètre sauvegardé' },
  { level: 3, match: ({ pageName, title }) => pageName === 'Paramètres' && title?.includes?.('sauvegardé') },
  { level: 3, match: ({ title }) => title === 'Avatar sauvegardé' || title === 'Avatar supprimé' },
  { level: 3, match: ({ title }) => title === 'Logo sauvegardé' || title === 'Logo supprimé' },
  { level: 3, match: ({ type }) => type === 'info' },
  { level: 2, match: ({ type }) => type === 'success' },
  { level: 2, match: ({ type }) => type === 'warning' },
  { level: 1, match: ({ type }) => type === 'error' },
];

/**
 * @param {Object} params - { type, title, pageName, message }
 * @returns {number} 1, 2 ou 3
 */
export function getNotificationLevel({ type = 'info', title = null, pageName = null, message = null }) {
  const ctx = { type, title, pageName, message };
  for (const rule of LEVEL_RULES) {
    try {
      if (rule.match(ctx)) return rule.level;
    } catch (e) {}
  }
  return 3;
}

export const NOTIFICATION_LEVEL_LABELS = {
  1: 'Priorité haute uniquement (erreurs)',
  2: 'Priorité haute et moyenne (erreurs + succès)',
  3: 'Toutes les notifications',
};
