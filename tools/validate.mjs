import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { validateEcologyPackage } from "../scripts/validation.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const manifest = readJson("module.json");
const data = readJson("data/ecology.json");
const en = readJson("lang/en.json");
const de = readJson("lang/de.json");
const errors = [];
if (manifest.version !== "1.2.4" || JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version !== "1.2.4") errors.push("Manifest and package versions must both be 1.2.4.");
const requireFile = (file) => { if (!fs.existsSync(path.join(root, file))) errors.push(`Missing referenced file ${file}`); };
for (const file of [...manifest.esmodules, ...manifest.styles, ...manifest.languages.map((entry) => entry.path)]) requireFile(file);
if (manifest.relationships.requires.find((entry) => entry.id === "runyth-hunters-bestiary")?.compatibility?.minimum !== "1.4.2") errors.push("Core minimum must be 1.4.2.");
const report = validateEcologyPackage(data, { strict: true });
if (!report.valid) errors.push(...report.issues.map((entry) => `${entry.code} ${entry.path}: ${entry.message}`));
if (JSON.stringify(Object.keys(en).sort()) !== JSON.stringify(Object.keys(de).sort())) errors.push("modular English/German localization parity failed.");
const scripts = [...fs.readdirSync(path.join(root, "scripts"), { recursive: true })].filter((name) => String(name).endsWith(".mjs"));
const runtimeEntries = ["main.mjs", ...scripts.map((relative) => path.join("scripts", String(relative)))];
for (const relative of runtimeEntries) execFileSync(process.execPath, ["--check", path.join(root, relative)], { stdio: "pipe" });

for (const relative of runtimeEntries) {
  const file = path.join(root, relative);
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:import|export)\s+(?:[^"']+?\s+from\s+)?["'](\.[^"']+)["']/g)) {
    const resolved = path.resolve(path.dirname(file), match[1]);
    if (!fs.existsSync(resolved)) errors.push(`Unresolved production import ${match[1]} from ${relative}`);
  }
}
const production = runtimeEntries.map((name) => fs.readFileSync(path.join(root, name), "utf8")).join("\n");
for (const forbidden of ["renderApplication", "renderApplicationV2", "renderChatMessage", "window.addEventListener", "$(`", "FilePicker("]) if (production.includes(forbidden)) errors.push(`Forbidden or broad runtime pattern: ${forbidden}`);
const css = fs.readFileSync(path.join(root, "styles/runyth-hunters-bestiary-aquatic-ecology.css"), "utf8");
for (const line of css.split(/\r?\n/)) if (/^(button|input|\.window-header|\.application|\.tab|\.sr-only)\b/.test(line.trim())) errors.push(`Unscoped CSS selector: ${line.trim()}`);
if (data.species.length !== 12 || data.signs.length !== 36 || data.rumors.length !== 60 || data.hunts.length !== 12) errors.push("Expected content counts not met.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Aquatic ecology validation passed: ${data.species.length} species, ${data.signs.length} signs, ${data.rumors.length} rumors, ${data.books.length} books, ${data.hunts.length} hunts, ${data.complications.length} complications, ${data.harvests.length} harvests.`);
console.log(`Localization parity: ${Object.keys(en).length} keys. Static runtime modules: ${runtimeEntries.length}.`);
