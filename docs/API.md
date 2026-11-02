# Runyth Hunter's Bestiary: Aquatic Ecology API

Release: 1.1.0. Public APIs are exposed through `game.modules.get("runyth-runyth-hunters-bestiary-aquatic-ecology").api`; no new global namespace is required. Existing compatibility surfaces are retained for this feature release.

## Shared core dependency

This module awaits `game.modules.get("hunters-bestiary").api.whenReady()` and consumes naming API 1.0.0 and dashboard API 1.0.0. See the core source archive for the authoritative contracts.

## Module-specific public API

After `await api.whenReady()`:

- Player-safe `getSpecies()`, `getSpeciesById(id)`, `getFoodWeb()`, `getRegionalDistribution()`, `getSeasonalCalendar()`, and `getEcologicalRelationships(speciesId)`.
- GM-only `getContentBundle()`, provider status, generated research books, and complete ecological truth.
- `validateEcology(content)`.
- Provider registration/unregistration through the module's ecology registry.
- `open(options)` and `getStatus()`.

The module consumes `core.ui`, registers `type: "subject"`, subject `Aquatic Ecology`, and provider ID `runyth-runyth-hunters-bestiary-aquatic-ecology`.

## Initialization, registration, and rollback

1. Expose the module's own API during `init` so callers can obtain `whenReady()` even when later initialization fails.
2. Register settings and narrow integrations idempotently.
3. During `ready`, verify required module/system versions and await every required `whenReady()` promise.
4. Negotiate naming/dashboard compatibility before provider content registration.
5. Register naming metadata with the core.
6. Validate local content before registering it.
7. Register provider, content, or system-layer records atomically where the owning API supports atomic registration.
8. Resolve the module's `whenReady()` status in `finally`, including failures rather than leaving callers pending.

When registration spans APIs, unregister earlier layers if a later layer fails. The aquatic D&D reference implementation rolls back its D&D provider and ecology provider registrations when atomic combined registration fails. Partial content acceptance is never implicit: use the owning module's explicit `allowPartial` or accepted-incomplete policy only when supported and intentionally enabled by a GM.

Unregister during a controlled development reload or rollback with `unregisterComplementaryModule(moduleId)` and the corresponding provider unregister method. Normal Foundry package disable/reload does not require a broad global unload hook.


## Permissions

Dashboard visibility does not grant authority. Every method that creates, updates, deletes, registers privileged provider data, or exposes GM-only truth checks `game.user.isGM` internally and fails with a localized error when unauthorized. Player-safe read APIs return filtered data where supported.
