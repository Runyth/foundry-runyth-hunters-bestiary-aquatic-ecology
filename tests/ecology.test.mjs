// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateEcologyPackage } from "../scripts/validation.mjs";
import {
  DEFAULT_DASHBOARD_SIZE,
  clampDashboardGeometry,
  resetDashboardPositionGeometry,
  resetDashboardSizeGeometry
} from "../scripts/geometry.mjs";

const data = JSON.parse(fs.readFileSync(new URL("../data/ecology.json", import.meta.url)));
const en = JSON.parse(fs.readFileSync(new URL("../lang/en.json", import.meta.url)));
const de = JSON.parse(fs.readFileSync(new URL("../lang/de.json", import.meta.url)));
const translated = (value, dictionary = en) => typeof value === "string" && value.startsWith("HBAE.") ? dictionary[value] : value;
const assertLocalized = (value, label) => {
  assert.equal(typeof value, "string", `${label} must be a localization key`);
  assert.match(value, /^HBAE\.Content\./, `${label} must use HBAE.Content`);
  assert.equal(typeof en[value], "string", `${label} missing English translation`);
  assert.equal(typeof de[value], "string", `${label} missing German translation`);
};
const byId = new Map(data.species.map((entry) => [entry.id, entry]));

test("bundled ecology is strict-valid", () => {
  const report = validateEcologyPackage(data, { strict: true });
  assert.equal(report.valid, true, JSON.stringify(report.issues, null, 2));
  assert.equal(report.complete, true);
});
test("library contains exactly twelve species", () => assert.equal(data.species.length, 12));
test("all ids are globally unique", () => {
  const ids = ["species","signs","rumors","books","hunts","complications","harvests"].flatMap((key) => data[key].map((record) => record.id));
  assert.equal(new Set(ids).size, ids.length);
});
test("every species has multiple signs and five rumor classes", () => {
  for (const species of data.species) { assert.ok(species.signIds.length >= 2); assert.equal(species.rumorIds.length, 5); }
});
test("every species has research, hunt, harvest, and explicit Actor policy", () => {
  for (const species of data.species) { assert.ok(species.bookIds.length); assert.equal(species.huntIds.length, 1); assert.equal(species.harvestIds.length, 3); assert.equal(species.actorPolicy.required, true); }
});
test("every predator relationship has range and salinity overlap", () => {
  for (const species of data.species) for (const predatorId of species.relationships.predators) if (byId.has(predatorId)) {
    const predator = byId.get(predatorId);
    assert.ok(species.habitat.regions.some((region) => predator.habitat.regions.includes(region)), `${species.id}/${predatorId} region`);
    assert.ok(Math.max(species.habitat.salinityPpt[0], predator.habitat.salinityPpt[0]) <= Math.min(species.habitat.salinityPpt[1], predator.habitat.salinityPpt[1]), `${species.id}/${predatorId} salinity`);
  }
});
test("food web references resolve and every relationship has overlap", () => {
  const nodes = new Set(data.foodWeb.nodes.map((record) => record.id));
  for (const edge of data.foodWeb.edges) { assert.ok(nodes.has(edge.from)); assert.ok(nodes.has(edge.to)); assert.ok(edge.regions.length); assert.ok(edge.months.length); }
});
test("all 33 Imperial months are represented", () => assert.deepEqual(data.seasonalCalendar.map((entry) => entry.month), Array.from({ length: 33 }, (_, index) => index + 1)));
test("breeding is inside seasonal presence", () => {
  for (const species of data.species) for (const month of species.reproduction.breedingMonths) assert.ok(species.habitat.seasonalMonths.includes(month));
});
test("harvest anatomy and safe handling are complete", () => {
  for (const record of data.harvests) { assertLocalized(record.sourceAnatomy, `${record.id}.sourceAnatomy`); assertLocalized(record.safeExtraction, `${record.id}.safeExtraction`); }
});
test("incomplete packages are rejected strictly and report exact paths", () => {
  const broken = structuredClone(data); delete broken.species[0].physiology;
  const report = validateEcologyPackage(broken, { strict: true });
  assert.equal(report.valid, false); assert.ok(report.issues.some((entry) => entry.path.includes("physiology")));
});
test("optional partial validation preserves failures without inventing data", () => {
  const broken = structuredClone(data); broken.species[0].signIds = [];
  const report = validateEcologyPackage(broken, { strict: false });
  assert.equal(report.valid, true); assert.equal(report.complete, false); assert.ok(report.issues.some((entry) => entry.code === "E_SIGNS_MIN")); assert.deepEqual(broken.species[0].signIds, []);
});
test("books, hunts, rumors, and signs resolve to existing species", () => {
  const ids = new Set(data.species.map((record) => record.id));
  for (const book of data.books) for (const id of book.species) assert.ok(ids.has(id));
  for (const hunt of data.hunts) assert.ok(ids.has(hunt.speciesId));
  for (const rumor of data.rumors) for (const id of rumor.speciesIds) assert.ok(ids.has(id));
  for (const sign of data.signs) for (const id of sign.speciesIds) assert.ok(ids.has(id));
});
test("keystone and apex roles are not collapsed into twelve bosses", () => {
  assert.ok(data.species.filter((s) => translated(s.ecologicalRole).includes("keystone")).length >= 2);
  assert.equal(data.species.filter((s) => translated(s.ecologicalRole) === "apex deep-water predator").length, 1);
  assert.ok(data.species.some((s) => translated(s.ecologicalRole) === "parasite"));
  assert.ok(data.species.some((s) => translated(s.ecologicalRole) === "colonial filter feeder"));
});
test("canonical campaign date is exact", () => assert.equal(data.canonicalDate, "0443-03-03"));


test("Foundry hooks and listeners are narrowly owned and idempotent", () => {
  const root = new URL("../", import.meta.url);
  const files = ["scripts/main.mjs","scripts/integrations.mjs","scripts/apps/dashboard.mjs","scripts/journals.mjs"];
  const source = files.map((file) => fs.readFileSync(new URL(file, root), "utf8")).join("\n");
  for (const forbidden of ["renderApplication", "renderApplicationV2", "renderChatMessage", "renderActorSheet", "renderItemSheet", "window.addEventListener", "ChatMessage.create", "game.socket"]) assert.equal(source.includes(forbidden), false, forbidden);
  assert.equal((source.match(/getSceneControlButtons/g) ?? []).length, 1);
  assert.equal((source.match(/game\.keybindings\.register/g) ?? []).length, 1);
  assert.match(source, /AbortController/); assert.match(source, /\.abort\(\)/);
});

test("manifest paths, localization keys, assets, and production imports resolve", () => {
  const root = new URL("../", import.meta.url); const manifest = JSON.parse(fs.readFileSync(new URL("module.json", root)));
  for (const file of [...manifest.esmodules, ...manifest.styles, ...manifest.languages.map((x) => x.path)]) assert.equal(fs.existsSync(new URL(file, root)), true, file);
  const en = JSON.parse(fs.readFileSync(new URL("lang/en.json", root))); const de = JSON.parse(fs.readFileSync(new URL("lang/de.json", root)));
  assert.deepEqual(Object.keys(en).sort(), Object.keys(de).sort());
  assert.equal(fs.existsSync(new URL("assets/aquatic-ecology.svg", root)), true);
  for (const file of ["scripts/main.mjs","scripts/api.mjs","scripts/registry.mjs","scripts/apps/dashboard.mjs"]) {
    const source = fs.readFileSync(new URL(file, root), "utf8");
    for (const match of source.matchAll(/(?:import|export)\s+(?:[^"']+?\s+from\s+)?["'](\.[^"']+)["']/g)) assert.equal(fs.existsSync(new URL(match[1], new URL(file, root))), true, `${file}: ${match[1]}`);
  }
});

test("player API paths do not expose provider truth", () => {
  const source = fs.readFileSync(new URL("../scripts/api.mjs", import.meta.url), "utf8");
  assert.match(source, /isGm\(\)/); assert.match(source, /events: \[\]/); assert.match(source, /return isGm\(\) \? clone\(species\.relationships\) : null/);
  assert.match(source, /getContentBundle: async \(\) => isGm\(\)/);
});

test("CSS selectors are module scoped", () => {
  const css = fs.readFileSync(new URL("../styles/runyth-hunters-bestiary-aquatic-ecology.css", import.meta.url), "utf8");
  for (const selector of ["button", "input", ".window-header", ".application", ".tab", ".sr-only"]) assert.equal(new RegExp(`(^|\\n)\\s*${selector.replace(".","\\.")}\\b`).test(css), false, selector);
});


test("dashboard is resizable and exposes separate settings reset controls", () => {
  const dashboard = fs.readFileSync(new URL("../scripts/apps/dashboard.mjs", import.meta.url), "utf8");
  const settings = fs.readFileSync(new URL("../scripts/settings.mjs", import.meta.url), "utf8");
  assert.match(dashboard, /window:\s*\{[^}]*resizable:\s*true/);
  assert.match(settings, /resetDashboardSize/);
  assert.match(settings, /resetDashboardPosition/);
  assert.match(settings, /restricted:\s*false/);
});

test("dashboard geometry preserves size and position independently", () => {
  const viewport = { width: 1600, height: 1000 };
  const saved = { left: 123, top: 87, width: 900, height: 610 };
  assert.deepEqual(resetDashboardSizeGeometry(saved, viewport), {
    left: 123,
    top: 87,
    width: DEFAULT_DASHBOARD_SIZE.width,
    height: DEFAULT_DASHBOARD_SIZE.height
  });
  assert.deepEqual(resetDashboardPositionGeometry(saved, viewport), {
    left: 350,
    top: 195,
    width: 900,
    height: 610
  });
});

test("dashboard geometry is clamped on smaller displays", () => {
  assert.deepEqual(clampDashboardGeometry({ left: 5000, top: 5000, width: 2000, height: 2000 }, { width: 800, height: 600 }), {
    left: 40,
    top: 40,
    width: 760,
    height: 560
  });
});

test("dashboard persists final geometry without blocking close", () => {
  const source = fs.readFileSync(new URL("../scripts/apps/dashboard.mjs", import.meta.url), "utf8");
  assert.match(source, /async _preClose\(options\)/);
  assert.match(source, /persistence = geometry\?\.flush\(\)/);
  assert.match(source, /Promise\.resolve\(persistence\)\.catch/);
  assert.doesNotMatch(source, /await this\.#geometry\?\.flush\(\)/);
  assert.match(source, /createGeometryPersistence/);
});

test("official ecology layer registers canonical naming metadata and validates each dashboard opening", () => {
  const main = fs.readFileSync(new URL("../scripts/bootstrap.mjs", import.meta.url), "utf8");
  const dashboard = fs.readFileSync(new URL("../scripts/apps/dashboard.mjs", import.meta.url), "utf8");
  assert.match(main, /type: "subject"/);
  assert.match(main, /subject: "Aquatic Ecology"/);
  assert.match(dashboard, /validateDashboardModuleName/);
});
