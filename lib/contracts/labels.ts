/**
 * Dictionnaires de normalisation pour les labels du module Base contractuelle.
 * Utilisés pour afficher les valeurs de manière cohérente dans toute l'interface.
 */

export const TYPE_LABELS: Record<string, string> = {
  supplier: "Fournisseur",
  cgv: "CGV",
  other: "Autre",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  analyzing: "Analyse en cours…",
  done: "Analysé",
  error: "Erreur d'analyse",
};

export const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
};

export const WORKSPACE_LABELS: Record<string, string> = {
  service1: "Service 1",
  service2: "Service 2",
};

/**
 * Retourne le label pour un type de contrat, ou la valeur brute si non trouvé.
 */
export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

/**
 * Retourne le label pour un statut, ou la valeur brute si non trouvé.
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Retourne le label pour un niveau de risque, ou la valeur brute si non trouvé.
 */
export function getRiskLabel(risk: string): string {
  return RISK_LABELS[risk] ?? risk;
}

/**
 * Retourne le label pour un workspace, ou la valeur brute si non trouvé.
 */
export function getWorkspaceLabel(workspace: string): string {
  return WORKSPACE_LABELS[workspace] ?? workspace;
}
