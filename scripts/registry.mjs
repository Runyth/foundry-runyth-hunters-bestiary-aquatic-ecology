// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import { MODULE_ID, PROVIDER_ID, CORE_ID, SETTINGS } from "./constants.mjs";
import { validateEcologyPackage } from "./validation.mjs";
import { buildCoreBundles } from "./core-bundles.mjs";

const providers = new Map();

function requireGm() {
  if (!game.user?.isGM) throw new Error(game.i18n.localize("HBAE.Error.GMOnly"));
}
function clone(value) { return foundry.utils.deepClone(value); }

async function recordIncomplete(providerId, report) {
  const current = game.settings.get(MODULE_ID, SETTINGS.ACCEPTED_INCOMPLETE) ?? {};
  await game.settings.set(MODULE_ID, SETTINGS.ACCEPTED_INCOMPLETE, {
    ...current,
    [providerId]: { acceptedAt: new Date().toISOString(), issues: clone(report.issues) }
  });
}

export async function registerAquaticExpansion(providerId, content, options = {}) {
  requireGm();
  if (!providerId || typeof providerId !== "string") throw new Error("providerId is required.");
  const allowIncomplete = options.allowIncomplete ?? game.settings.get(MODULE_ID, SETTINGS.ALLOW_INCOMPLETE);
  const report = validateEcologyPackage(content, { strict: !allowIncomplete });
  if (!report.complete && !allowIncomplete) {
    const error = new Error(`Aquatic package ${providerId} is incomplete.`);
    error.validation = report;
    throw error;
  }
  if (!report.complete) await recordIncomplete(providerId, report);
  const core = game.modules.get(CORE_ID)?.api;
  if (!core?.registerContent) throw new Error("Runyth Hunter's Bestiary core API registerContent is unavailable.");
  const bundles = buildCoreBundles(content);
  await core.registerContent(providerId, bundles, { allowIncomplete });
  providers.set(providerId, { providerId, content: clone(content), bundles, complete: report.complete, validation: report, registeredAt: new Date().toISOString() });
  return getProviderStatus(providerId);
}

export async function unregisterAquaticExpansion(providerId) {
  requireGm();
  const core = game.modules.get(CORE_ID)?.api;
  if (core?.unregisterContent) await core.unregisterContent(providerId);
  providers.delete(providerId);
  return true;
}

export function getProviderStatus(providerId) {
  if (providerId) {
    const record = providers.get(providerId);
    return record ? clone({ providerId: record.providerId, complete: record.complete, validation: record.validation, registeredAt: record.registeredAt, species: record.content.species.length }) : null;
  }
  return [...providers.values()].map((record) => clone({ providerId: record.providerId, complete: record.complete, validation: record.validation, registeredAt: record.registeredAt, species: record.content.species.length }));
}

export async function registerBundledEcology(data) {
  return registerAquaticExpansion(PROVIDER_ID, data, { allowIncomplete: false });
}
