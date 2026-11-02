import test from "node:test";
import assert from "node:assert/strict";
import { visibleSpeciesForCurrentUser } from "../scripts/api.mjs";

function installRuntime({ isGM = false, getMonster = () => null } = {}) {
  const previous = { game: globalThis.game, foundry: globalThis.foundry };
  globalThis.foundry = { utils: { deepClone: value => structuredClone(value) } };
  globalThis.game = {
    user: { isGM },
    modules: new Map([["runyth-hunters-bestiary", { api: { getMonster } }]])
  };
  return () => { globalThis.game = previous.game; globalThis.foundry = previous.foundry; };
}

test("player-visible species retain a stable id when core knowledge filtering returns null", () => {
  const restore = installRuntime({ getMonster: () => null });
  try {
    assert.deepEqual(visibleSpeciesForCurrentUser({ id: "glassfin-pike", name: "hidden" }), { id: "glassfin-pike" });
  } finally { restore(); }
});

test("player-visible species use the richer core record when one is available", () => {
  const restore = installRuntime({ getMonster: id => ({ id, name: "visible" }) });
  try {
    assert.deepEqual(visibleSpeciesForCurrentUser({ id: "glassfin-pike", name: "packaged" }), { id: "glassfin-pike", name: "visible" });
  } finally { restore(); }
});

test("GM species retain the complete packaged record", () => {
  const restore = installRuntime({ isGM: true });
  try {
    const species = { id: "glassfin-pike", name: "packaged", nested: { value: 1 } };
    assert.deepEqual(visibleSpeciesForCurrentUser(species), species);
    assert.notEqual(visibleSpeciesForCurrentUser(species), species);
  } finally { restore(); }
});

test("invalid packaged species are rejected as null rather than throwing", () => {
  const restore = installRuntime();
  try {
    assert.equal(visibleSpeciesForCurrentUser(null), null);
    assert.equal(visibleSpeciesForCurrentUser({}), null);
    assert.equal(visibleSpeciesForCurrentUser([]), null);
  } finally { restore(); }
});
