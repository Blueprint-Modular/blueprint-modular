# Rapport d'audit 360° — Composants Blueprint Modular

*Document de référence. Correctifs critiques et importants appliqués (graphiques SVG, tooltip mobile, FAB, Progress ARIA, Input label, Audio).*

---

## 1. Résumé exécutif

L'application est globalement solide : architecture claire, thème clair/sombre fonctionnel, navigation mobile bien pensée, sandbox interactif opérationnel. Les problèmes identifiés étaient majoritairement des optimisations mobile (taille des cibles de tap) et des lacunes ARIA, sans blocage critique après correctifs.

---

## 2. Correctifs appliqués

### 🔴 CRITIQUE — Graphiques SVG responsives
- **bpm.linechart, bpm.barchart, bpm.areachart, bpm.scatterchart** : ajout de `viewBox`, wrapper `width: 100%`, `height: auto`, `preserveAspectRatio="xMidYMid meet"`. Les graphiques ne débordent plus sur mobile ; rapport d’aspect conservé.

### 🟠 IMPORTANT
- **Bottom nav / main** : le `<main>` avait déjà `pb-[calc(5rem+env(safe-area-inset-bottom,0px))]` (≥ 80px) sur mobile — aucun changement.
- **bpm.tooltip** : fallback mobile et clavier — `onClick` (toggle sur appareils tactiles), `onFocus` / `onBlur`, `tabIndex={0}`, `role="button"` pour afficher le tooltip sans hover.
- **bpm.fab** : position en classes Tailwind ; sur mobile `max-md:bottom-[calc(5rem+1rem)]` pour que le FAB reste au-dessus de la bottom nav (63px + marge).

### 🟡 MODÉRÉ
- **bpm.progress** : `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` sur la piste de progression.
- **bpm.input** : association label / champ via `useId()`, `htmlFor` et `id` ; `min-h-[44px]` pour cible tactile.
- **bpm.audio** : `w-full max-w-full` pour éviter largeur fixe sur petits écrans.

---

## 3. Problèmes restants (non traités dans ce cycle)

### 🟡 Modéré
- Tailles de cibles tactiles < 44px sur d’autres composants (selectbox, numberinput, dateinput, pagination, rating, treeview) — recommandation : `min-h-[44px]` ou zone de tap étendue.
- **bpm.topnav** : pas de gestion du overflow si nombreux liens — `overflow-x-auto` à prévoir.

### 🔵 Mineur
- **bpm.html** : le composant utilise un `div` avec `dangerouslySetInnerHTML`, pas un iframe ; pas de sandbox à ajouter ici. Pour les composants qui utilisent des iframes (Map, PlotlyChart, AltairChart, PdfViewer), un attribut `sandbox` peut être envisagé selon les cas d’usage.
- **bpm.barcode / bpm.qrcode** : tailles fixes — envisager `width="100%"` + viewBox pour adaptation.
- Icônes PWA : un seul fichier source pour 192×192 et 512×512 — générer des exports dédiés par taille.

---

## 4. Récapitulatif par criticité (après correctifs)

| Priorité | Nombre | Composants concernés |
|----------|--------|----------------------|
| 🔴 Critique | 0 | — (traités) |
| 🟠 Important | 0 | — (traités) |
| 🟡 Modéré | 2 | tap targets globaux, topnav overflow |
| 🔵 Mineur | 3 | html/iframe sandbox (N/A pour Html), barcode/qrcode, icônes PWA |

---

## 5. Points forts à noter ✅

- Mode sombre complet avec variables CSS `--bpm-*` et persistance localStorage.
- Sandbox interactif avec aperçu en direct et génération de code Python.
- Grille d’accueil responsive (`minmax(min(260px, 100%), 1fr)`).
- Navigation mobile : bottom nav avec icônes + labels, safe-area.
- Tableaux et onglets avec scroll horizontal.
- Accordéon : boutons 44px.
- Manifest PWA avec `display_override`, shortcuts, catégories.
