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

# Plus d'exclusion globale : le barrel est la source de vérité.
# Tous les composants exportés dans bpm.tsx sont inclus dans llms.txt.
EXCLUDE = set()

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


def parse_interface_non_export(source: str, interface_name: str) -> list[dict]:
    """Interface sans mot-clé export (ex. ChatProps dans bpm.tsx)."""
    pattern = re.compile(
        r"interface\s+" + re.escape(interface_name) + r"\s*\{",
        re.DOTALL,
    )
    m = pattern.search(source)
    if not m:
        return []
    start = m.end()
    depth = 1
    i = start
    while i < len(source) and depth > 0:
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
        i += 1
    body = source[start : i - 1]
    props = []
    pending_doc = ""
    for line in body.splitlines():
        jsdoc_m = re.match(r"\s*/\*\*(.+?)\*/", line)
        if jsdoc_m:
            pending_doc = jsdoc_m.group(1).strip().strip("*").strip()
            continue
        prop_m = re.match(r"\s*(\w+)(\??):\s*(.+?)(?:;|$)", line)
        if prop_m:
            name = prop_m.group(1)
            optional = prop_m.group(2) == "?"
            typ = prop_m.group(3).strip().rstrip(";").strip()
            typ = re.sub(r"\s+", " ", typ)
            props.append({
                "name": name,
                "type": typ,
                "required": not optional,
                "doc": pending_doc,
            })
            pending_doc = ""
        else:
            pending_doc = ""
    return props


def parse_props_interface(source: str, interface_name: str) -> list[dict]:
    """
    Extrait les props d'une interface TypeScript.
    Retourne une liste de {name, type, required, doc}
    """
    # Trouver le bloc de l'interface
    pattern = re.compile(
        r"export\s+interface\s+" + re.escape(interface_name) +
        r"\s*(?:extends\s+[^{]+)?\s*\{",
        re.DOTALL
    )
    m = pattern.search(source)
    if not m:
        return []

    # Parser qui compte les accolades pour gérer les JSDoc avec {} imbriqués
    start = m.end()
    depth = 1
    i = start
    while i < len(source) and depth > 0:
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
        i += 1
    body = source[start:i-1]
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


def pascal_case(bpm_name: str) -> str:
    """button → Button, chatInterface → ChatInterface (camelCase → PascalCase)"""
    return bpm_name[0].upper() + bpm_name[1:] if bpm_name else ""


def extract_barrel_components(bpm_tsx_path: Path) -> list[str]:
    """
    Extrait la liste des noms bpm.* depuis le barrel (source de vérité).
    Retourne les noms camelCase : ['accordion', 'altairChart', ...].
    """
    source = bpm_tsx_path.read_text(encoding="utf-8", errors="ignore")
    names = []
    # wrap(Component) ou wrap<Props>(Component) → clé bpm
    for m in re.finditer(r"^\s+(\w+):\s*wrap(?:<[^>]+>)?\s*\(", source, re.MULTILINE):
        names.append(m.group(1))
    # Cas spéciaux non wrap() : spinner, tabs, page
    if "spinner:" in source and "spinner" not in names:
        names.append("spinner")
    if "tabs:" in source and "tabs" not in names:
        names.append("tabs")
    if re.search(r"^\s+page:\s*\(", source, re.MULTILINE) and "page" not in names:
        names.append("page")
    return sorted(set(names))


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
- Table — prop render dans columns (pas renderCell) — jamais JSX dans data[]
- INTERDIT : renderCell — alias non supporté par Table.tsx ; utiliser render
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
- Table : render dans columns — jamais renderCell
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
    name = comp.get("bpm_name") or bpm_name(comp["name"])
    lines = [f"## bpm.{name}"]
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
    name = comp.get("bpm_name") or bpm_name(comp["name"])
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

    # --- Barrel = source de vérité : extraire les noms bpm.* ---
    barrel_names = extract_barrel_components(BPM_TSX)
    if args.verbose:
        print(f"Barrel : {len(barrel_names)} composants")

    # --- Pour chaque nom barrel, résoudre le fichier et parser ---
    components = []
    skipped = []
    bpm_source_text = BPM_TSX.read_text(encoding="utf-8", errors="ignore")

    for bpm_key in barrel_names:
        if bpm_key in EXCLUDE:
            skipped.append(bpm_key)
            continue

        if bpm_key == "page":
            components.append({
                "name": "Page",
                "bpm_name": "page",
                "props": parse_props_interface(bpm_source_text, "PageProps"),
                "doc": "Conteneur page (core) — props : children.",
                "anti_patterns": [],
            })
            continue
        if bpm_key == "title":
            tp = parse_props_interface(bpm_source_text, "TitleProps")
            # Title local core : seule interface TitleProps à props minimales (avant tout import ambigu)
            components.append({
                "name": "Title",
                "bpm_name": "title",
                "props": tp,
                "doc": "Titre h1 minimal (core) — children uniquement. Pour titres hiérarchiques : bpm.title1 … title4 ou titleBpm.",
                "anti_patterns": [],
            })
            continue
        if bpm_key == "chat":
            components.append({
                "name": "Chat",
                "bpm_name": "chat",
                "props": parse_interface_non_export(bpm_source_text, "ChatProps"),
                "doc": "Chat Ollama local (démo).",
                "anti_patterns": [],
            })
            continue
        if bpm_key == "toast":
            components.append({
                "name": "Toast",
                "bpm_name": "toast",
                "props": [
                    {"name": "message", "type": "string", "required": True,
                     "doc": "Texte principal"},
                    {"name": "type", "type": "string", "required": False,
                     "doc": "success | error | warning | info"},
                    {"name": "title", "type": "string | null", "required": False, "doc": ""},
                    {"name": "pageName", "type": "string | null", "required": False, "doc": ""},
                    {"name": "pageIcon", "type": "string | null", "required": False, "doc": "SVG HTML"},
                    {"name": "id", "type": "number", "required": False, "doc": "Clé React"},
                    {"name": "onClose", "type": "() => void", "required": True,
                     "doc": "Fermeture — apps : ToastProvider + useToast()"},
                ],
                "doc": "Toast visuel ; en production préférer useToast().",
                "anti_patterns": [],
            })
            continue

        # Mapping barrel key → nom de fichier (PascalCase)
        file_stem = pascal_case(bpm_key)
        # Cas particuliers (alias ou nom différent)
        alias_map = {
            "titleBpm": "Title",
            "title1": "Title",
            "title2": "Title",
            "title3": "Title",
            "title4": "Title",
            "crud": "CrudPage",
            "selectbox": "Selectbox",
            "nfcBadge": "NfcBadge",
            "qrCode": "QRCode",
            "fab": "FAB",
            "html": "Html",
            "empty": "Empty",
        }
        file_stem = alias_map.get(bpm_key, file_stem)
        tsx_file = COMP_DIR / f"{file_stem}.tsx"
        if not tsx_file.exists():
            # Composant sans fichier dédié ou nom différent : entrée minimale
            components.append({
                "name": file_stem,
                "bpm_name": bpm_key,
                "props": [],
                "doc": f"Composant bpm.{bpm_key} — voir @blueprint-modular/core ou BPM_API.md.",
                "anti_patterns": [],
            })
            if args.verbose:
                print(f"  [MIN] bpm.{bpm_key} — pas de fichier {tsx_file.name}")
            continue
        comp = parse_component_file(tsx_file)
        if comp is None:
            components.append({
                "name": file_stem,
                "bpm_name": bpm_key,
                "props": [],
                "doc": f"Composant bpm.{bpm_key} — interface non parsée (voir BPM_API.md).",
                "anti_patterns": [],
            })
            if args.verbose:
                print(f"  [MIN] bpm.{bpm_key} — interface non parsée")
            continue
        comp["bpm_name"] = bpm_key
        if bpm_key in ("title1", "title2", "title3", "title4"):
            lv = bpm_key.replace("title", "")
            comp["doc"] = (
                (comp.get("doc") or "").rstrip()
                + f" — bpm.{bpm_key} : niveau {lv} implicite, ne pas passer level."
            ).strip()
        components.append(comp)
        if args.verbose:
            print(f"  [OK] bpm.{bpm_key} — {len(comp['props'])} props")

    print(f"Générés : {len(components)} composants ({len(skipped)} exclus)")

    # --- Générer llms.txt complet ---
    full_lines = [HEADER_FULL.format(version=version, date=today)]
    full_lines.append("## COMPOSANTS\n")
    for comp in components:
        full_lines.append(format_component_full(comp))
    full_lines.append(PATTERN_MODAL)
    full_lines.append(PATTERN_ROUTES)
    full_content = "\n".join(full_lines)

    # --- Générer llms-core.txt compact ---
    core_comps = [c for c in components if (c.get("bpm_name") or bpm_name(c["name"])) in CORE_COMPONENTS]
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
