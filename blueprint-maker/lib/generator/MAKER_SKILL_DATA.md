# Données fictives sectorielles — .Maker

Données de référence pour générer des tableaux de bord KPI réalistes (libellés et fourchettes français).

## Industrie (manufacturing)

| KPI | Libellé typique | Fourchette réaliste | Unité | Exemple delta |
|-----|-----------------|---------------------|-------|---------------|
| TRS | Taux de rendement synthétique | 70–88 % | % | +1.2, -0.8 |
| Taux rebut | Taux de rebut | 0.5–2.5 % | % | -0.2, +0.1 |
| Disponibilité | Disponibilité équipement | 85–95 % | % | +0.5 |
| MTTR | Temps moyen de réparation | 1.5–4 h | h | -0.3 |
| OEE | Efficacité globale équipement | 65–82 % | % | +1.0 |
| Nombre de pièces | Pièces produites (période) | 8 000–25 000 | — | +340, -120 |

Exemple valeurs cohérentes : TRS 78 %, taux rebut 1.8 %, disponibilité 91 %, MTTR 2.4 h.

## Retail (commerce)

| KPI | Libellé typique | Fourchette réaliste | Unité | Exemple delta |
|-----|-----------------|---------------------|-------|---------------|
| CA | Chiffre d'affaires | 120–450 k€ | k€ ou € | +3.2, -1.1 |
| Panier moyen | Panier moyen | 35–85 € | € | +2.5 |
| Taux conversion | Taux de conversion | 1.5–4 % | % | +0.2 |
| Commandes | Nombre de commandes | 1 200–5 000 | — | +180, -90 |
| Taux rupture | Taux de rupture stock | 2–8 % | % | -0.5 |
| NPS | Net Promoter Score | 35–72 | — | +3, -2 |

Exemple : CA 245 k€, panier moyen 52 €, taux conversion 2.8 %, commandes 2 840.

## Services (conseil, support, SaaS)

| KPI | Libellé typique | Fourchette réaliste | Unité | Exemple delta |
|-----|-----------------|---------------------|-------|---------------|
| Taux satisfaction | Satisfaction client | 78–96 % | % | +1.5 |
| Délai moyen | Délai de traitement | 2–8 j | j | -0.5 |
| Taux résolution | Résolution 1er contact | 65–88 % | % | +2.0 |
| MRR | Revenus récurrents mensuels | 45–120 k€ | k€ | +5.2 |
| Churn | Taux d'attrition | 2–6 % | % | -0.3 |
| Taux disponibilité | Disponibilité service | 99.0–99.9 % | % | +0.05 |

Exemple : satisfaction 89 %, délai moyen 4.2 j, MRR 78 k€, churn 3.2 %.

---

Utilisation : pour un prompt "tableau de bord KPI [secteur]", le générateur choisit les KPIs du secteur ci‑dessus, applique des valeurs dans les fourchettes et des deltas réalistes (positif/négatif selon le sens du KPI).
