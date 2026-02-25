const fs = require("fs");
const path = require("path");

// Replace common French mojibake (UTF-8 read as Latin-1)
function fixMojibake(s) {
  s = s.replace(/\u00C3\u00A0/g, "\u00E0"); // à
  s = s.replace(/\u00C3\u00A9/g, "\u00E9"); // é
  s = s.replace(/\u00C3\u00AA/g, "\u00EA"); // ê
  s = s.replace(/\u00C3\u00A2/g, "\u00E2"); // â
  s = s.replace(/\u00C3\u00B4/g, "\u00F4"); // ô
  s = s.replace(/\u00C3\u00A7/g, "\u00E7"); // ç
  s = s.replace(/\u00C3\u00A8/g, "\u00E8"); // è
  s = s.replace(/\u00C3\u00AF/g, "\u00EF"); // ï
  s = s.replace(/\u00C3\u00AB/g, "\u00EB"); // ë
  s = s.replace(/\u00C3\u00B9/g, "\u00F9"); // ù
  s = s.replace(/\u00C3\u00BB/g, "\u00FB"); // û
  s = s.replace(/\u00C3\u00AE/g, "\u00EE"); // î
  s = s.replace(/Ã /g, "à");
  s = s.replace(/Ã©/g, "é");
  s = s.replace(/Ãª/g, "ê");
  s = s.replace(/Ã¢/g, "â");
  s = s.replace(/Ã´/g, "ô");
  s = s.replace(/Ã§/g, "ç");
  s = s.replace(/Ã¨/g, "è");
  s = s.replace(/Ã¯/g, "ï");
  s = s.replace(/Ã«/g, "ë");
  s = s.replace(/Ã¹/g, "ù");
  s = s.replace(/Ã»/g, "û");
  s = s.replace(/Ã®/g, "î");
  // À (U+00C0) : UTF-8 C3 80 lu comme Latin-1 → Ã (C3) + U+0080
  s = s.replace(/\u00C3\u0080/g, "\u00C0");
  // Guillemets et ponctuation (mojibake)
  s = s.replace(/Â«/g, "«");
  s = s.replace(/Â»/g, "»");
  // Apostrophe typographique U+2019 (UTF-8 E2 80 99 lu comme Latin-1 → â + 0x80 + 0x99)
  s = s.replace(/\u00E2\u0080\u0099/g, "\u2019");
  // Guillemet simple droit › U+203A (UTF-8 E2 80 BA lu comme Latin-1 → âº)
  s = s.replace(/\u00E2\u0080\u00BA/g, "\u203A");
  s = s.replace(/\u2013/g, "–"); // en dash
  s = s.replace(/\u2014/g, "—"); // em dash
  // Orphan bytes (UTF-8 continuation bytes read as Latin-1)
  s = s.replace(/l'\u0080\u0099/g, "l'");
  s = s.replace(/—\u0080\u0094/g, "—");
  s = s.replace(/\u2019\u0080\u0099/g, "\u2019");
  s = s.replace(/\u00B0\u0080\u0094/g, "—");
  // nÅ -> nœ (oe ligature)
  s = s.replace(/nÅ/g, "nœ");
  s = s.replace(/nÅ/g, "nœ");
  // Em dash mojibake: â + 0x80 0x94 (UTF-8 for U+2014)
  s = s.replace(/â\u0080\u0094/g, "—");
  return s;
}

const dirs = [
  path.join(__dirname, "..", "frontend", "static"),
  path.join(__dirname, "..", "frontend", "api-docs"),
  path.join(__dirname, "..", "deploy"),
];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const walk = (d) => {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.toLowerCase().endsWith(".html")) {
        let s = fs.readFileSync(full, "utf8");
        const out = fixMojibake(s);
        if (out !== s) {
          fs.writeFileSync(full, out, "utf8");
          console.log("Fixed", path.relative(process.cwd(), full));
        }
      }
    }
  };
  walk(dir);
}
console.log("Done.");
