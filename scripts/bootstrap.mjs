import { MODULE_ID, CORE_ID } from "./constants.mjs";
import { loadEcologyData } from "./data.mjs";
import { validateEcologyPackage } from "./validation.mjs";
import { registerBundledEcology } from "./registry.mjs";
import { createApi, markReady } from "./api.mjs";
import { openAquaticDashboard } from "./apps/dashboard.mjs";
import { registerSettings } from "./settings.mjs";
import { registerIntegrations } from "./integrations.mjs";

const startupFailures = [];

Hooks.once("init", () => {
  const module = game.modules.get(MODULE_ID);
  module.api = createApi(openAquaticDashboard);
  startupFailures.length = 0;
  try { registerSettings(); } catch (error) { startupFailures.push({ stage: "settings", message: error.message }); console.error(`${MODULE_ID} | Settings failed`, error); }
  try { registerIntegrations(openAquaticDashboard); } catch (error) { startupFailures.push({ stage: "integrations", message: error.message }); console.error(`${MODULE_ID} | Integrations failed`, error); }
});

Hooks.once("ready", async () => {
  const failures = [...startupFailures];
  try {
    const core = game.modules.get(CORE_ID);
    if (!core?.active || !core.api?.whenReady) throw new Error("Hunter's Bestiary 1.4.2+ is not active or its public API is unavailable.");
    await core.api.whenReady();
    core.api.registerComplementaryModule({
      moduleId: MODULE_ID,
      currentTitle: game.modules.get(MODULE_ID)?.title,
      subject: "Aquatic Ecology",
      type: "subject",
      dashboardApplicationId: "hbae-dashboard",
      providerId: MODULE_ID,
      version: game.modules.get(MODULE_ID)?.version,
      apiCompatibilityVersion: "1.0.0"
    });
    core.api.warnForInvalidComplementaryModuleName(MODULE_ID, { reason: "startup" });
    const data = await loadEcologyData();
    const report = validateEcologyPackage(data, { strict: true });
    if (!report.valid) throw Object.assign(new Error("Bundled aquatic ecology is invalid."), { validation: report });
    if (game.user.isGM) await registerBundledEcology(data);
    console.info(`${MODULE_ID} | Ready with ${data.species.length} aquatic species.`);
  } catch (error) {
    failures.push({ stage: "ready", message: error.message, validation: error.validation });
    console.error(`${MODULE_ID} | Startup failure`, error);
  } finally {
    markReady({ failures, providerRegistered: game.user.isGM && failures.length === 0 });
  }
});
