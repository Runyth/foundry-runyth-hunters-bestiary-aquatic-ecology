import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));

function referencedRuntimePaths() {
  return [
    ...(manifest.esmodules ?? []),
    ...(manifest.scripts ?? []),
    ...(manifest.styles ?? []),
    ...(manifest.languages ?? []).map((entry) => entry.path)
  ];
}

test("the fixed shared result contract is required", () => {
  const core = manifest.relationships?.requires?.find(entry => entry.id === "runyth-hunters-bestiary");
  assert.equal(core?.compatibility?.minimum, "1.4.2");
});

test("all manifest runtime paths exist in the source tree", () => {
  for (const relative of referencedRuntimePaths()) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, `Missing ${relative}`);
  }
});

test("the install archive contains every manifest runtime path after extraction", () => {
  execFileSync("python3", ["tools/package.py"], { cwd: root, stdio: "pipe" });
  const archive = path.join(root, "dist", `${manifest.id}-v${manifest.version}.zip`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "hbae-package-"));
  try {
    execFileSync("python3", ["-c", [
      "import sys, zipfile",
      "archive, destination = sys.argv[1:3]",
      "with zipfile.ZipFile(archive) as z: z.extractall(destination)"
    ].join("\n"), archive, temporary], { stdio: "pipe" });
    const installedRoot = path.join(temporary, manifest.id);
    for (const relative of referencedRuntimePaths()) {
      assert.equal(fs.existsSync(path.join(installedRoot, relative)), true, `Archive omitted ${relative}`);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
