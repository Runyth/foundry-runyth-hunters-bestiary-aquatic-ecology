import test from "node:test";
import assert from "node:assert/strict";
import { clearEcologyDataCache, loadEcologyData } from "../scripts/data.mjs";

test("concurrent ecology data requests share one browser fetch", async () => {
  const previousFetch = globalThis.fetch;
  let calls = 0;
  clearEcologyDataCache();
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    assert.equal(options.cache, "default");
    await new Promise(resolve => setTimeout(resolve, 3));
    return { ok: true, json: async () => ({ species: [] }) };
  };
  try {
    const [a, b, c] = await Promise.all([loadEcologyData(), loadEcologyData(), loadEcologyData()]);
    assert.equal(calls, 1);
    assert.equal(a, b);
    assert.equal(b, c);
  } finally {
    clearEcologyDataCache();
    globalThis.fetch = previousFetch;
  }
});
