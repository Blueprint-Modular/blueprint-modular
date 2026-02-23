# -*- coding: utf-8 -*-
"""Update reste-a-faire.html: Documentation line and A faire section."""
import re

path = "frontend/static/knowledge-base/reste-a-faire.html"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

# Remove duplicate Publication line
s = s.replace(
    "<li>Publication sur PyPI (<code>pip install blueprint-modular</code>) et publication automatique via GitHub Actions (tag <code>v*</code>)</li>\n        ",
    "",
    1,
)

# Documentation line (match straight or curly apostrophe)
s = re.sub(
    r"<li>Documentation \(en cours d['\u2019]enrichissement\)</li>",
    "<li>Documentation : site statique (docs.blueprint-modular.com), pages composants avec sandbox et exemples</li>",
    s,
    count=1,
)

# A faire
s = s.replace("<li>Tests automatisés</li>", "<li>Tests automatisés (runtime et app)</li>", 1)
s = s.replace(
    "<li>WebSocket ou SSE pour réactivité granulaire (mise à jour ciblée sans re-run complet)</li>",
    "<li>WebSocket ou SSE pour réactivité granulaire (mise à jour ciblée sans re-run complet du script)</li>",
    1,
)
for apost in ["'", "\u2019"]:
    old = f"<li>Exemples d{apost}apps complètes et templates (login, chat IA, paramètres)</li>"
    if old in s:
        s = s.replace(old, "<li>CI/CD : tests, lint (publication PyPI déjà en place)</li>", 1)
        break
s = s.replace(
    "<li>Intégration CI/CD (publication PyPI via workflow — fait ; reste tests, lint, etc.)</li>\n        ",
    "",
    1,
)
s = s.replace(
    "<li><strong>Multi-langue</strong> : (1) site Blueprint Modular (doc + landing) avec sélecteur FR/EN ; (2) composant module réutilisable <code>bpm.i18n</code> pour les apps construites avec BPM (traductions, locale).</li>",
    "<li><strong>Multi-langue</strong> : site doc + landing avec sélecteur FR/EN ; composant <code>bpm.i18n</code> pour les apps BPM</li>",
    1,
)
s = s.replace(
    "<li><strong>Modules</strong> : pages pré-construites réutilisables — Wiki (appelable, remplissable via IA), Module IA, Module Veille, Module IBKR, Module Analyse de document. Voir la section <a href=\"https://blueprint-modular.com/modules.html\">Modules</a>.</li>",
    "<li><strong>Modules</strong> : pages réutilisables — Wiki, IA, Veille, IBKR, Analyse de document (voir <a href=\"https://blueprint-modular.com/modules.html\">Modules</a>)</li>",
    1,
)
s = s.replace(
    "<li><strong>Module Authentification (add-in)</strong> : à développer en reprenant le modèle de <a href=\"https://myportfolio.beam-consulting.fr\">Myportfolio.beam-consulting</a> (flux, UX, comportement).</li>\n        ",
    "",
    1,
)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("Done:", path)
