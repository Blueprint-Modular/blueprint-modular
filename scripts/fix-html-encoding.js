/**
 * Fix HTML files that were saved in Windows-1252 / Latin-1 but declared as UTF-8.
 * Reads as 'latin1' and writes as 'utf8'.
 */
const fs = require("fs");
const path = require("path");

const dirs = ["frontend/static", "deploy", "frontend/api-docs"];
const ext = ".html";

for (const dir of dirs) {
  const root = path.join(__dirname, "..", dir);
  if (!fs.existsSync(root)) continue;
  const walk = (d) => {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.toLowerCase().endsWith(ext)) {
        try {
          const raw = fs.readFileSync(full, { encoding: "latin1" });
          fs.writeFileSync(full, raw, "utf8");
          console.log("OK", path.relative(process.cwd(), full));
        } catch (err) {
          console.error("ERR", full, err.message);
        }
      }
    }
  };
  walk(root);
}
console.log("Done.");
