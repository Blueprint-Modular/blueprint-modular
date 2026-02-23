#!/usr/bin/env python3
"""Replace mojibake in 'Ce qu'il reste ... faire' -> 'Ce qu'il reste à faire'."""
import pathlib

# Mojibake: UTF-8 bytes for 'à' (C3 A0) interpreted as Latin-1 -> U+00C3 (Ã) + U+00A0 (nbsp) or space
BAD_NBSP = "\u00c3\u00a0"  # Ã + nbsp
BAD_SP = "\u00c3 "         # Ã + space
GOOD = "\u00e0"            # à

root = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "static"
count = 0
for f in root.rglob("*.html"):
    try:
        text = f.read_text(encoding="utf-8")
    except Exception:
        continue
    if BAD_NBSP not in text and BAD_SP not in text:
        continue
    new_text = text.replace("reste " + BAD_NBSP + " faire", "reste " + GOOD + " faire")
    new_text = new_text.replace("reste " + BAD_SP + " faire", "reste " + GOOD + " faire")
    if new_text != text:
        f.write_text(new_text, encoding="utf-8")
        count += 1
        print(f.relative_to(root))
print("Updated", count, "files")
