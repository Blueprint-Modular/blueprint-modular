#!/usr/bin/env node
/**
 * Synchronise la version depuis package.json (source unique) vers :
 * - pyproject.toml
 * - bpm/__init__.py
 * - frontend/static (tous les .html) : footer "Blueprint Modular vX.Y.Z" et versions.html "vX.Y.Z (actuelle)"
 * Usage: node scripts/sync-version.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;
if (!version) {
  console.error("package.json n'a pas de champ version.");
  process.exit(1);
}

console.log("Version à synchroniser:", version);

// 1. pyproject.toml
const pyprojectPath = path.join(ROOT, "pyproject.toml");
let pyproject = fs.readFileSync(pyprojectPath, "utf8");
pyproject = pyproject.replace(/^version\s*=\s*"[^"]*"/m, `version = "${version}"`);
fs.writeFileSync(pyprojectPath, pyproject);
console.log("  → pyproject.toml");

// 2. bpm/__init__.py
const bpmInitPath = path.join(ROOT, "bpm", "__init__.py");
let bpmInit = fs.readFileSync(bpmInitPath, "utf8");
bpmInit = bpmInit.replace(/^__version__\s*=\s*"[^"]*"/m, `__version__ = "${version}"`);
fs.writeFileSync(bpmInitPath, bpmInit);
console.log("  → bpm/__init__.py");

// 3. frontend/static HTML: Blueprint Modular v0.1.21 et v0.1.21 (actuelle)
const staticDir = path.join(ROOT, "frontend", "static");
const versionRegex = /0\.1\.\d+/g;
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const before = content;
  // Footer générique
  content = content.replace(/Blueprint Modular v\d+\.\d+\.\d+/g, `Blueprint Modular v${version}`);
  // versions.html: "v0.1.21 (actuelle)"
  content = content.replace(/v\d+\.\d+\.\d+\s*\(actuelle\)/g, `v${version} (actuelle)`);
  // versions.html: "version 0.1.21" dans les listes
  content = content.replace(/(version\s+)\d+\.\d+\.\d+/g, `$1${version}`);
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

let count = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".html")) {
      if (replaceInFile(full)) count++;
    }
  }
}

if (fs.existsSync(staticDir)) {
  walk(staticDir);
  console.log(`  → frontend/static: ${count} fichier(s) HTML mis à jour`);
}

// i18n ja.json has "meta": "Blueprint Modular v0.1.21"
const i18nDir = path.join(staticDir, "i18n");
if (fs.existsSync(i18nDir)) {
  const jaPath = path.join(i18nDir, "ja.json");
  if (fs.existsSync(jaPath)) {
    let ja = fs.readFileSync(jaPath, "utf8");
    ja = ja.replace(/Blueprint Modular v\d+\.\d+\.\d+/, `Blueprint Modular v${version}`);
    fs.writeFileSync(jaPath, ja);
    console.log("  → frontend/static/i18n/ja.json");
  }
}

console.log("Sync version terminé.");
