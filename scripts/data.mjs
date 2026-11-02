let cache;
let loading;

export async function loadEcologyData() {
  if (cache) return cache;
  loading ??= (async () => {
    const response = await fetch("modules/hunters-bestiary-aquatic-ecology/data/ecology.json", { cache: "default" });
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
