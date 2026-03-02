/**
 * Template pré-validé BPM pour le dashboard production.
 * Référence pour le Builder : structure attendue, composants corrects, appels API.
 * Données : GET /api/production/lines, /api/production/metrics, /api/production/alerts.
 */
export const PRODUCTION_DASHBOARD_TEMPLATE = `bpm.title("Dashboard Production", level=1)
bpm.tabs("Vue globale | Lignes | Alertes")

bpm.metric("TRS global", "74.2 %", delta=1.2, border=True)
bpm.metric("Disponibilité", "88.1 %", border=True)
bpm.metric("Performance", "86.5 %", border=True)
bpm.metric("Qualité", "97.3 %", border=True)
bpm.linechart("Lun,72;Mar,74;Mer,73;Jeu,75;Ven,74;Sam,71;Dim,70")
bpm.progress(value=74, max=100, label="TRS cible 80%")

bpm.title("Lignes de production", level=2)
bpm.badge("EXT-A", variant="success")
bpm.metric("EXT-A TRS", "76.2 %", border=True)
bpm.badge("EXT-B", variant="success")
bpm.metric("EXT-B TRS", "73.1 %", border=True)
bpm.badge("FORM-1", variant="warning")
bpm.metric("FORM-1 TRS", "68.4 %", border=True)
bpm.badge("COND-1", variant="success")
bpm.metric("COND-1 TRS", "79.0 %", border=True)
bpm.table("Ligne,TRS,Statut;EXT-A,76.2%,actif;EXT-B,73.1%,actif;FORM-1,68.4%,maintenance;COND-1,79.0%,actif")

bpm.title("Alertes actives", level=2)
bpm.panel("TRS sous seuil", "Ligne FORM-1 : TRS à 68.4% (seuil 70%). Vérifier les arrêts non planifiés.", variant="warning")
bpm.table("Type,Sévérité,Message;trs_low,warning,TRS FORM-1 sous 70%;loss_high,info,Pertes matière ligne EXT-B")`;
