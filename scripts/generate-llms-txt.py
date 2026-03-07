#!/usr/bin/env python3
"""
generate-llms-txt.py
Génère public/llms.txt et public/llms-core.txt depuis les sources TypeScript.

Source principale  : packages/core/src/bpm.tsx  (interfaces + JSDoc)
Sources composants : components/bpm/*.tsx        (interfaces Props + JSDoc)

Run depuis la racine du repo :
  python scripts/generate-llms-txt.py

Options :
  --dry-run   Affiche le résultat sans écrire les fichiers
  --verbose   Affiche les composants parsés
"""

import os
import re
import sys
import argparse
from pathlib import Path
from datetime import date

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).parent.parent
BPM_TSX   = REPO_ROOT / "packages" / "core" / "src" / "bpm.tsx"
COMP_DIR  = REPO_ROOT / "components" / "bpm"
OUT_FULL  = REPO_ROOT / "public" / "llms.txt"
OUT_CORE  = REPO_ROOT / "public" / "llms-core.txt"

VERSION_RE = re.compile(r'"version"\s*:\s*"([^"]+)"')
PKG_JSON   = REPO_ROOT / "package.json"

# Composants prioritaires pour llms-core.txt (tier local Qwen)
CORE_COMPONENTS = {
    "metric", "metricRow", "table", "plotlyChart", "modal",
    "button", "input", "selectbox", "numberInput", "badge",
    "tabs", "spinner", "pageHeader", "container", "card",
}

# Composants à exclure (trop spécialisés ou non recommandés en génération)
EXCLUDE = {
    "altairChart", "areaChart", "barChart", "lineChart", "scatterChart",
    "assistantPanel", "audio", "video", "map", "nfcBadge", "offlineIndicator",
    "pdfViewer", "qrCode", "barcode", "colorPicker", "jsonViewer",
    "treeview", "toast", "fab", "loadingBar", "skeleton",
}

# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def get_version() -> str:
    try:
        txt = PKG_JSON.read_text(encoding="utf-8")
        m = VERSION_RE.search(txt)
        return m.group(1) if m else "unknown"
    except Exception:
        return "unknown"


def parse_jsdoc(block: str) -> str:
    """Extrait le texte d'un bloc JSDoc /** ... */"""
    lines = []
    for line in block.strip().splitlines():
        line = re.sub(r"^\s*/?\*+/?\s*", "", line).strip()
        if line:
            lines.append(line)
    return " ".join(lines)


def parse_props_interface(source: str, interface_name: str) -> list[dict]:
    """
    Extrait les props d'une interface TypeScript.
    Retourne une liste de {name, type, required, doc}
    """
    # Trouver le bloc de l'interface
    pattern = re.compile(
        r"export\s+interface\s+" + re.escape(interface_name) +
        r"\s*(?:extends\s+\S+)?\s*\{([^}]+)\}",
        re.DOTALL
    )
    m = pattern.search(source)
    if not m:
        return []

    body = m.group(1)
    props = []
    # Parser ligne par ligne avec JSDoc précédent
    lines = body.splitlines()
    pending_doc = ""
    for line in lines:
        # JSDoc inline /** ... */
        jsdoc_m = re.match(r"\s*/\*\*(.+?)\*/", line)
        if jsdoc_m:
            pending_doc = jsdoc_m.group(1).strip().strip("*").strip()
            continue
        # Prop : name?: type ou name: type
        prop_m = re.match(r"\s*(\w+)(\??):\s*(.+?)(?:;|$)", line)
        if prop_m:
            name     = prop_m.group(1)
            optional = prop_m.group(2) == "?"
            typ      = prop_m.group(3).strip().rstrip(";").strip()
            # Nettoyer les types complexes
            typ = re.sub(r"\s+", " ", typ)
            props.append({
                "name":     name,
                "type":     typ,
                "required": not optional,
                "doc":      pending_doc,
            })
            pending_doc = ""
        else:
            pending_doc = ""
    return props


def format_prop(p: dict) -> str:
    marker = "*" if p["required"] else "?"
    doc = f"  — {p['doc']}" if p["doc"] else ""
    return f"  {p['name']}{marker}: {p['type']}{doc}"


def parse_component_file(path: Path) -> dict | None:
    """
    Parse un fichier composant .tsx et retourne :
    {name, bpm_name, props, doc, anti_patterns}
    """
    source = path.read_text(encoding="utf-8", errors="ignore")

    # Chercher la première interface Props exportée
    iface_m = re.search(r"export\s+interface\s+(\w+Props)\b", source)
    if not iface_m:
        return None

    iface_name = iface_m.group(1)
    # Nom du composant = fichier sans extension
    comp_name = path.stem

    # Chercher JSDoc juste avant l'interface
    before = source[:iface_m.start()]
    jsdoc_m = re.search(r"/\*\*(.+?)\*/\s*$", before, re.DOTALL)
    doc = parse_jsdoc(jsdoc_m.group(1)) if jsdoc_m else ""

    props = parse_props_interface(source, iface_name)

    # Anti-patterns dans les commentaires
    anti = []
    for line in source.splitlines():
        if "INTERDIT" in line or "jamais" in line.lower() or "never" in line.lower():
            clean = re.sub(r"^\s*[/*]+\s*", "", line).strip()
            if clean and len(clean) < 120:
                anti.append(clean)

    return {
        "name":          comp_name,
        "iface":         iface_name,
        "props":         props,
        "doc":           doc,
        "anti_patterns": anti[:3],  # max 3
    }


def bpm_name(comp_name: str) -> str:
    """Button → button, MetricRow → metricRow, PlotlyChart → plotlyChart"""
    return comp_name[0].lower() + comp_name[1:]


# ---------------------------------------------------------------------------
# Extraction depuis bpm.tsx (interfaces locales non wrappées)
# ---------------------------------------------------------------------------

def parse_bpm_tsx_local_interfaces(source: str) -> list[dict]:
    """
    Extrait les interfaces définies localement dans bpm.tsx
    (Page, Title, Metric, Table, Chat) avec leurs props.
    """
    results = []
    # Trouver toutes les interfaces exportées locales
    for m in re.finditer(r"export\s+interface\s+(\w+Props)\b", source):
        iface_name = m.group(1)
        props = parse_props_interface(source, iface_name)
        if props:
            comp_name = iface_name.replace("Props", "")
            results.append({
                "name":  comp_name,
                "iface": iface_name,
                "props": props,
                "doc":   "",
                "anti_patterns": [],
            })
    return results


# ---------------------------------------------------------------------------
# Génération llms.txt
# ---------------------------------------------------------------------------

HEADER_FULL = """\
# Blueprint Modular — Agent Context File
# Version : {version}
# Date    : {date}
# URL canonique : https://blueprint-modular.com/llms.txt
#
# Ce fichier est la référence machine de @blueprint-modular/core.
# Il est généré automatiquement depuis les sources TypeScript.
# À injecter dans le contexte de génération de code BPM.

## IMPORT OBLIGATOIRE
import {{ bpm }} from '@blueprint-modular/core'
import '@blueprint-modular/core/dist/style.css'
INTERDIT : import {{ bpm.modal }} ou tout autre destructuring

## RÈGLES CRITIQUES
- 'use client' — en première ligne, une seule fois
- Modal — {{isOpen && bpm.modal({{ isOpen:true, onClose, title, children }})}} — TOUJOURS dans return()
- Graphiques — bpm.plotlyChart UNIQUEMENT — jamais bpm.lineChart/barChart/areaChart
- Métriques — bpm.metricRow({{ children: <> {{bpm.metric(...)}} </> }})
- Table — renderCell dans columns — jamais JSX dans data[]
- Spinner — size 'small'|'medium'|'large' — jamais 'md'/'sm'
- Toggle — prop value (booléen) — jamais checked
- Text — style={{{{ fontWeight:600 }}}} — jamais prop weight
- Routes — App Router UNIQUEMENT — jamais NextApiRequest/NextApiResponse
- Fetch — res.ok vérifié avant JSON.parse
- Data — Array.isArray(data) vérifié avant setItems(data)

"""

HEADER_CORE = """\
# Blueprint Modular — Agent Context File (CORE)
# Version : {version}
# Date    : {date}
# Format compact pour modèles locaux (Qwen, Mistral)
# Composants essentiels uniquement — référence complète : blueprint-modular.com/llms.txt

## IMPORT
import {{ bpm }} from '@blueprint-modular/core'
INTERDIT : import {{ bpm.modal }} ou tout destructuring

## RÈGLES ABSOLUES
- Modal : {{isOpen && bpm.modal({{ isOpen:true, onClose, title, children }})}} — TOUJOURS dans return()
- Graphiques : bpm.plotlyChart UNIQUEMENT
- Métriques : bpm.metricRow({{ children: <> {{bpm.metric(...)}} </> }})
- Spinner : size 'small'|'medium'|'large' — jamais 'md'/'sm'
- Toggle : prop value (booléen) — jamais checked
- Routes : App Router — NextResponse de 'next/server' — jamais NextApiRequest

"""

PATTERN_MODAL = '''
## PATTERN MODAL OBLIGATOIRE
```tsx
const [isOpen, setIsOpen] = useState(false)
const [form, setForm] = useState({ nom: '', valeur: 0 })
const [saving, setSaving] = useState(false)

const handleSave = async () => {
  setSaving(true)
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) throw new Error('Erreur serveur')
    setIsOpen(false)
  } catch (e) { console.error(e) }
  finally { setSaving(false) }
}

// Dans return() :
{isOpen && bpm.modal({ isOpen: true, onClose: () => setIsOpen(false), title: 'Créer',
  children: (
    <>
      {bpm.input({ label: 'Nom', value: form.nom, onChange: (v) => setForm({ ...form, nom: v }) })}
      {bpm.button({ children: saving ? '...' : 'Enregistrer', onClick: handleSave, disabled: saving })}
    </>
  )
})}
```
'''

PATTERN_ROUTES = '''
## ROUTES API — App Router uniquement
```ts
// app/api/items/route.ts
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json([])
}
export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, data: body })
}
// INTERDIT : NextApiRequest / export default dans app/api/
```
'''


def format_component_full(comp: dict) -> str:
    name = bpm_name(comp["name"])
    lines = [f"### bpm.{name}"]
    if comp["doc"]:
        lines.append(comp["doc"])
    lines.append("```")
    for p in comp["props"]:
        lines.append(format_prop(p))
    lines.append("```")
    if comp["anti_patterns"]:
        for ap in comp["anti_patterns"]:
            lines.append(f"INTERDIT : {ap}")
    lines.append("")
    return "\n".join(lines)


def format_component_core(comp: dict) -> str:
    name = bpm_name(comp["name"])
    required = [p for p in comp["props"] if p["required"]]
    optional = [p for p in comp["props"] if not p["required"]][:4]  # max 4 optionnels
    parts = [f"bpm.{name}({{"]
    for p in required:
        parts.append(f"  {p['name']}*: {p['type']}")
    for p in optional:
        parts.append(f"  {p['name']}?: {p['type']}")
    parts.append("})")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Génère llms.txt depuis les sources TypeScript")
    parser.add_argument("--dry-run", action="store_true", help="Affiche sans écrire")
    parser.add_argument("--verbose", action="store_true", help="Détails des composants parsés")
    args = parser.parse_args()

    version = get_version()
    today   = date.today().isoformat()

    # --- Collecter les composants ---
    components = []
    skipped    = []

    for tsx_file in sorted(COMP_DIR.glob("*.tsx")):
        comp = parse_component_file(tsx_file)
        if comp is None:
            skipped.append(tsx_file.stem)
            continue
        name = bpm_name(comp["name"])
        if name in EXCLUDE:
            skipped.append(name)
            continue
        components.append(comp)
        if args.verbose:
            print(f"  [OK] bpm.{name} — {len(comp['props'])} props")

    print(f"Parsés : {len(components)} composants ({len(skipped)} exclus/ignorés)")

    # --- Générer llms.txt complet ---
    full_lines = [HEADER_FULL.format(version=version, date=today)]
    full_lines.append("## COMPOSANTS\n")
    for comp in components:
        full_lines.append(format_component_full(comp))
    full_lines.append(PATTERN_MODAL)
    full_lines.append(PATTERN_ROUTES)
    full_content = "\n".join(full_lines)

    # --- Générer llms-core.txt compact ---
    core_comps = [c for c in components if bpm_name(c["name"]) in CORE_COMPONENTS]
    core_lines = [HEADER_CORE.format(version=version, date=today)]
    core_lines.append("## COMPOSANTS ESSENTIELS\n")
    for comp in core_comps:
        core_lines.append(format_component_core(comp))
        core_lines.append("")
    core_lines.append(PATTERN_MODAL)
    core_content = "\n".join(core_lines)

    print(f"llms.txt      : {len(full_content):,} chars — {len(components)} composants")
    print(f"llms-core.txt : {len(core_content):,} chars — {len(core_comps)} composants")

    if args.dry_run:
        print("\n--- llms-core.txt preview ---")
        print(core_content[:2000])
        return

    # --- Écrire les fichiers ---
    OUT_FULL.parent.mkdir(parents=True, exist_ok=True)
    OUT_FULL.write_text(full_content, encoding="utf-8")
    OUT_CORE.write_text(core_content, encoding="utf-8")
    print(f"Écrit : {OUT_FULL}")
    print(f"Écrit : {OUT_CORE}")


if __name__ == "__main__":
    main()
