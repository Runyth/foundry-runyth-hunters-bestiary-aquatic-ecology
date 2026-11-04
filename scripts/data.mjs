// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
let cache;
let loading;

export async function loadEcologyData() {
  if (cache) return cache;
  loading ??= (async () => {
    const response = await fetch("modules/runyth-hunters-bestiary-aquatic-ecology/data/ecology.json", { cache: "default" });
    if (!response.ok) throw new Error(`Failed to load aquatic ecology data: ${response.status}`);
    cache = Object.freeze(await response.json());
    return cache;
  })().finally(() => { loading = undefined; });
  return loading;
}

export function clearEcologyDataCache() {
  cache = undefined;
  loading = undefined;
}
