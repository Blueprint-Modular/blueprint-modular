Versions des pages pour l’URL /api/docs (intégration MyPortfolio).

Fichiers :
  landing.html   → page d’accueil /api/docs
  components.html → /api/docs/components
  reference.html  → /api/docs/reference

Pour mettre à jour la doc sur MyPortfolio (frontend/public) :
  Copier landing.html   → frontend/public/api-docs-landing.html
  Copier components.html → frontend/public/api-docs-components.html
  Copier reference.html  → frontend/public/api-docs-reference.html
  Copier depuis la racine de blueprint-modular : Logo-BPM-nom.jpg, Logo-BPM-seul.png → frontend/public/

Les chemins dans ces HTML utilisent /api/docs et /Logo-BPM-*. Ils sont corrects une fois les fichiers dans frontend/public (servis à la racine de l’app).
