#!/usr/bin/env python3
"""
Generate lib/generated/bpm-components.json from the Python package registry.
Run from repo root: python scripts/generate-bpm-components-json.py
Used by Next.js docs/components page so the list follows the package.
"""
import json
import os
import sys

# Run from repo root
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ROOT)
os.chdir(REPO_ROOT)

from bpm._doc_components import COMPONENT_DOC

OUT_DIR = os.path.join(REPO_ROOT, "lib", "generated")
OUT_FILE = os.path.join(OUT_DIR, "bpm-components.json")

os.makedirs(OUT_DIR, exist_ok=True)
with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump({"components": COMPONENT_DOC}, f, ensure_ascii=False, indent=2)

print(f"Wrote {OUT_FILE} ({len(COMPONENT_DOC)} components)")
