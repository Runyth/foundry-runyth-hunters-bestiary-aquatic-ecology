import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("every bundled species declares a packaged image", async () => {
  const data = JSON.parse(await readFile(new URL("../data/ecology.json", import.meta.url), "utf8"));
  assert.ok(data.species.length > 0);
  for (const species of data.species) assert.match(species.img, /^modules\/hunters-bestiary-aquatic-ecology\//);
});

test("dashboard delegates species image changes to Runyth Hunter's Bestiary core", async () => {
  const source = await readFile(new URL("../scripts/apps/dashboard.mjs", import.meta.url), "utf8");
  const template = await readFile(new URL("../templates/dashboard.hbs", import.meta.url), "utf8");
  assert.match(source, /openMonsterImagePicker/);
  assert.match(source, /getMonsterImage/);
  assert.match(template, /data-action="hbaeChangeImage"/);
});
