import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../scripts/apps/dashboard.mjs", import.meta.url), "utf8");

test("Aquatic Ecology ApplicationV2 position contains only width and height", () => {
  assert.match(source, /const DEFAULT_POSITION = Object\.freeze\(\{ width: DEFAULT_GEOMETRY\.width, height: DEFAULT_GEOMETRY\.height \}\)/);
  assert.match(source, /position: DEFAULT_POSITION/);
  const position = source.match(/const DEFAULT_POSITION = Object\.freeze\(\{([^}]*)\}\)/)?.[1] ?? "";
  assert.doesNotMatch(position, /minWidth|minHeight/);
});

test("minimum dimensions remain in geometry defaults", () => {
  assert.match(source, /DEFAULT_GEOMETRY = Object\.freeze\(\{[^}]*minWidth: 720[^}]*minHeight: 520/);
  assert.match(source, /defaults: DEFAULT_GEOMETRY/);
});


test("dashboard foregrounding waits for the asynchronous render", () => {
  assert.match(source, /const rendered = instance\.render\(\{ force: true \}\)/);
  assert.match(source, /Promise\.resolve\(rendered\)\.then/);
  assert.match(source, /instance\?\.rendered && instance\.element/);
});

test("research-book generation uses success-close and failure-foreground progress policy", () => {
  assert.match(source, /autoCloseOnSuccess: true/);
  assert.match(source, /foregroundOnFailure: true/);
  assert.match(source, /continueOnError: true/);
  assert.match(source, /returnReport: true/);
  assert.match(source, /if \(report\.failed\.length\)/);
  assert.doesNotMatch(source, /this\.render\(\{ force: true \}\);\s*return;\s*}\s*ui\.notifications\.info/s);
});
