import { MODULE_ID, PROVIDER_ID } from "./constants.mjs";
import { loadEcologyData } from "./data.mjs";
import { validateEcologyPackage } from "./validation.mjs";
import { buildCoreBundles } from "./core-bundles.mjs";
import { registerAquaticExpansion, unregisterAquaticExpansion, getProviderStatus } from "./registry.mjs";
import { generateResearchBooks } from "./journals.mjs";

let readyResolve;
const readyPromise = new Promise((resolve) => { readyResolve = resolve; });
let readyState = { ready: false, failures: [] };

function clone(value) { return foundry.utils.deepClone(value); }
function isGm() { return Boolean(game.user?.isGM); }
export function visibleSpeciesForCurrentUser(species) {
  if (!species || typeof species !== "object" || Array.isArray(species) || typeof species.id !== "string" || !species.id.trim()) return null;
  if (isGm()) return clone(species);
  const core = game.modules.get("hunters-bestiary")?.api;
  const visible = core?.getMonster?.(species.id);
  return visible && typeof visible === "object" ? visible : { id: species.id };
}

export function markReady(state) {
  readyState = { ...state, ready: true };
  readyResolve(clone(readyState));
}

export function createApi(openDashboard) {
  return Object.freeze({
    whenReady: () => readyPromise,
    getSpecies: async () => (await loadEcologyData()).species.map(visibleSpeciesForCurrentUser).filter(Boolean),
    getSpeciesById: async (id) => {
      const record = (await loadEcologyData()).species.find((entry) => entry.id === id);
      return record ? visibleSpeciesForCurrentUser(record) : null;
    },
    getFoodWeb: async () => { const web = (await loadEcologyData()).foodWeb; return isGm() ? clone(web) : clone({ nodes: web.nodes.filter((node) => ["producer", "primary-consumer", "prey", "detritus", "pulse-resource", "predator-prey"].includes(node.kind)), edges: [] }); },
    getRegionalDistribution: async () => { const value = (await loadEcologyData()).regionalDistribution; return isGm() ? clone(value) : clone({ regions: value.regions, barriers: value.barriers }); },
    getSeasonalCalendar: async () => { const value = (await loadEcologyData()).seasonalCalendar; return isGm() ? clone(value) : clone(value.map(({ month, phase, regionalNotes }) => ({ month, phase, regionalNotes, events: [] }))); },
    getEcologicalRelationships: async (speciesId) => {
      const data = await loadEcologyData();
      const species = data.species.find((entry) => entry.id === speciesId);
      if (!species) return null;
      return isGm() ? clone(species.relationships) : null;
    },
    getContentBundle: async () => isGm() ? clone(buildCoreBundles(await loadEcologyData())) : (() => { throw new Error(game.i18n.localize("HBAE.Error.GMOnly")); })(),
    getProviderStatus: (providerId) => isGm() ? getProviderStatus(providerId) : [],
    validateEcology: async (content) => validateEcologyPackage(content ?? await loadEcologyData(), { strict: true }),
    registerAquaticExpansion,
    unregisterAquaticExpansion,
    generateResearchBooks: async (options) => generateResearchBooks(await loadEcologyData(), options),
    open: (options = {}) => openDashboard(options),
    getStatus: () => clone(readyState),
    providerId: PROVIDER_ID,
    moduleId: MODULE_ID
  });
}
