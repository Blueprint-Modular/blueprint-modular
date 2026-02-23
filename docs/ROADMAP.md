# Roadmap BPM — fonctionnalités (référence interne)

Ce document relie le [paysage concurrentiel](../frontend/static/knowledge-base/competitive-landscape.md) aux composants et chantiers BPM.  
**Statuts :** ✅ Fait | 🚧 En cours | 📋 Prévu | ⏸ Backend (Python) requis

---

## Pour que « pip install blueprint-modular && bpm run app.py » fonctionne

| Chantier | Statut | Détail |
|----------|--------|--------|
| Package Python sur PyPI (ou installable) | ✅ | Publié sur PyPI : `blueprint-modular`, CLI `bpm`, publication via tag `v*` (Trusted Publishing) |
| Commande `bpm run app.py` | 📋 | Exécution du script + serveur HTTP qui sert la page et reçoit les événements |
| Protocole frontend / backend | 📋 | Premier rendu, puis événements (clics, etc.) → mise à jour refs → renvoi des delta de rendu (ou re-run) ; WebSocket ou HTTP |
| APIs Python des composants | 📋 | `bpm.title`, `bpm.button`, `bpm.metric`, etc. + `bpm.session_state`, `bpm.rerun()` |
| `bpm init` (optionnel) | 📋 | Génération d’un squelette de projet |

**Doc utilisateur :** [knowledge-base/reste-a-faire.html](../frontend/static/knowledge-base/reste-a-faire.html) (publiée dans la doc). Page [Installation](../frontend/static/get-started/installation.html) mise à jour avec un encart qui pointe vers « Ce qu’il reste à faire ».

---

## Différenciateurs BPM (à développer en priorité)

| Axe | Statut | Doc / Fichiers |
|-----|--------|----------------|
| Réactivité granulaire + syntaxe simple | 🚧 | [REACTIVITE_GRANULAIRE.md](REACTIVITE_GRANULAIRE.md) — `reactiveStore.js`, `useReactive.js` en place ; runtime Python à venir |
| Design system cohérent (`bpm.*`) | ✅ | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — `theme.css` (tokens), tous composants avec `className` |
| Registry `$` et `@` | 🚧 | [REGISTRY.md](REGISTRY.md) — `bpm/__init__.py` (ref, register, page, sidebar, cache_data) ; stub utilisable, runtime à brancher |
| Config-driven layout (`app.config.js`) | 🚧 | [APP_CONFIG.md](APP_CONFIG.md) — `app.config.example.js` + schéma doc ; Layout.jsx prêt pour config |

---

## Architecture & exécution

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Réactivité granulaire (re-render ciblé) | 🚧 | Store + hook : `reactiveStore.js`, `useReactive` ; doc : [REACTIVITE_GRANULAIRE.md](REACTIVITE_GRANULAIRE.md). Runtime Python à venir. |
| Callbacks déclaratifs (Input / Output / State) | 📋 | À définir côté API Python |
| Graphe de dépendances réactif | 📋 | Idem |

---

## Layout & UI

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Classes CSS sur les composants | 🚧 | Prop `className` sur tous les composants BPM |
| Layouts pixel-perfect / HTML/CSS natif | ✅ | Grid, Box, Divider, Card, Accordion, Stepper, Drawer, FAB, TopNav en place ; doc catalogue |
| Cards natives | ✅ | `Card` (header/body/footer, image, actions) |
| Navbar horizontale | ✅ | `DocNav` ; `TopNav` (générique) |
| Grid layout configurable | ✅ | `Grid` (cols, gap, responsive xs/sm/md/lg) |
| Accordion (multi-sections) | ✅ | `Accordion` (sections, allowMultiple) |
| Stepper / Wizard | ✅ | `Stepper` (steps, currentStep, content par étape) |
| Drawer / Offcanvas | ✅ | `Drawer` (placement left/right, overlay) |
| Floating action button | ✅ | `FAB` (placement corners) |

---

## Composants données

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| DataTable avancée (tri, filtre, pagination, export) | 🚧 | `Table` existe ; étendre avec tri multi, pagination, export |
| Pivot table | 📋 | Composant dédié ou lib externe (ag-grid, etc.) |
| Tree view / hiérarchie | ✅ | `TreeView` (nodes avec children) |
| Timeline | ✅ | `Timeline` (items date/title/description) |
| KPI card avec sparkline | ✅ | `SparklineMetric` (label, value, delta, sparklineData) |

---

## Graphiques

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Sélection interactive → données Python | ⏸ | Côté Python + événements chart |
| Crossfiltering | ⏸ | Idem |
| Gantt, Network, Sankey, 3D | 📋 | Wrappers Chart.js / Plotly / D3 ou composants dédiés |

---

## Formulaires & inputs

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Validation formulaire côté Python | ⏸ | API Python |
| Input masqué / formaté (téléphone, IBAN) | 📋 | `Input` avec `mask` / `format` |
| Range date picker | ✅ | `DateRangePicker` (value { start, end }) |
| Autocomplete / combobox | ✅ | `Autocomplete` (options, filtered list) |
| Rich text editor | 📋 | Intégration Quill/TipTap ou composant simple |
| Signature pad | 📋 | `SignaturePad` |
| Rating / stars | ✅ | `Rating` (value, max, onChange) |
| Kanban board | 📋 | `Kanban` (colonnes + drag & drop) |

---

## Authentification & droits

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Auth native (login, sessions, rôles) | ⏸ | Backend + composants Login / Session |
| SSO / SAML / LDAP | ⏸ | Backend |
| Contrôle d’accès par composant | 📋 | Prop `requiredRole` ou HOC `withAuth` |
| Audit log | ⏸ | Backend |

---

## Performance & scalabilité

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Mise à jour partielle sans re-run | ⏸ | Architecture runtime |
| Pagination serveur | 🚧 | `Table` + prop `pagination="server"` |
| WebSocket état partagé, job queue, scaling | ⏸ | Backend / infra |

---

## Déploiement & intégration

| Fonctionnalité | Statut | BPM / Note |
|----------------|--------|------------|
| Embedding dans page HTML | 📋 | Bundle BPM en UMD + script d’init |
| Jupyter natif | ⏸ | Package Python `bpm` + extension |
| REST API auto-générée | ⏸ | Python |
| Theming via config | ✅ | `theme.css` (tokens), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) ; surcharge par variables CSS |

---

## Site vitrine & communication (to-do interne)

| Tâche | Statut | Note |
|-------|--------|------|
| Landing refonte (style type Streamlit) | ✅ | Hero, différenciateurs, boutons, lien Pourquoi BPM |
| Doc : Pourquoi BPM, Ce qu'il reste à faire | ✅ | Pages + sidebar + encart Installation |
| Logo → blueprint-modular.com, sandbox → catalogue | ✅ | Toutes pages doc ; liens sandbox → catalogue composants |
| Doc déployée (doc.js, burger mobile, responsive) | ✅ | deploy-from-git.sh copie doc.js ; chemins /doc.js |
| Sandbox par composant | 📋 | Un sandbox (preview live) dédié par composant BPM, pour tester chaque composant isolément |
| Page doc par composant | 📋 | Une page de doc par composant (ex. button.html, metric.html) avec description, props, exemples et lien sandbox |
| Formulaire de contact | 📋 | Page ou modal sur le site (vitrine et/ou doc) pour permettre aux visiteurs de contacter l’équipe BPM |

---

## Différenciateurs BPM (objectifs)

| Objectif | Statut |
|----------|--------|
| Réactivité granulaire + syntaxe simple | 🚧 Store + useReactive en place ; runtime Python à faire |
| Design system cohérent `bpm.*` | ✅ theme.css, DESIGN_SYSTEM.md, composants avec tokens |
| Registry `$` et `@` | 🚧 Stub Python (ref, register, page, sidebar) ; à brancher au runtime |
| Layout piloté par `app.config.js` | 🚧 app.config.example.js, APP_CONFIG.md ; Layout prêt |

---

## Composants BPM (inventaire)

En place : Button, Input, Textarea, Selectbox, Checkbox, Toggle, Slider, DateInput, NumberInput, DateRangePicker, ColorPicker, FileInput, RadioGroup, Autocomplete, Rating — Title, Caption, Badge, CodeBlock — Metric, Table, SparklineMetric, TreeView, Timeline — Panel, Message, Modal, Toast, Spinner, Progress, Skeleton, EmptyState, Tooltip — Box, Card, Divider, Tabs, Expander, Accordion, Stepper, Drawer, FAB, Grid, TopNav — Layout, DocNav, DocSidebar, DocLayout, Sandbox — Breadcrumb, Chip, Avatar, CopyButton — reactiveStore, useReactive.

---

*Dernière mise à jour : roadmap alignée avec l'état actuel (site, doc, différenciateurs, composants, to-do formulaire contact).*
