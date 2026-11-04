# Changelog

## 1.2.6 — 2026-11-04

- The installable archive now ships every relative import the manifest entry needs, so the module's buttons and settings register on world load instead of silently failing.

## 1.2.5 — 2026-11-03

- AGENTS.md conformance release: the manifest author carries the standard organisational URL, and the shipped homebrew content states its CC BY-SA 4.0 content licence in the README and on the content data records. No runtime behaviour relationship or dependency change.

## 1.2.4 — 2026-08-24

- First publication as a Runyth module: `runyth-hunters-bestiary-aquatic-ecology` / **Runyth Hunter's Bestiary: Aquatic Ecology** with the publication standard in place — deterministic `-mod`, `-src`, and `-doc` archives with per-version checksums, byte-identical rebuild verification, standard quality and release pipelines, the full GNU AGPL-3.0-or-later licence with the standard source notice, the standard README licence chapter, and the manifest URL surfaces.

- Fixed the player-visible species API so a species hidden by Runyth Hunter's Bestiary knowledge filtering falls back to its stable `{ id }` reference instead of becoming `null`.
- Prevented dependent system layers from receiving malformed species arrays during startup validation.
- Added regression coverage for hidden species, visible species, GM species access, and invalid packaged entries.
- No world-data migration is required.

## 1.2.3 — 2026-08-03

- Fixed Foundry VTT v13 startup failure `Cannot add property _startupFailures, object is not extensible`.
- Moved transient initialization failures out of the frozen public API into private module-scoped state.
- Preserved settings and integration failure reporting through the existing ready-state status API.
- Added regression coverage preventing future writes to frozen API objects during startup.

## 1.2.2 — 2026-08-03

- Cached ecology data and deduplicated concurrent fetches.
- Generated independent research books with bounded concurrency, suppressed intermediate directory renders, and retained ordered results and complete failure reporting.
- Reduced repeated localization, image-service, validation, and settings work during dashboard context construction.
- Persisted tab and geometry changes asynchronously without delaying interaction or window close.
- Reused already rendered dashboards instead of forcing a full rerender when only foregrounding was needed.

## 1.2.1 — 2026-08-03

- Replaced embedded bilingual content records with standard Foundry localization keys.
- Made Foundry’s global Language Preference the sole language selector.
- Removed custom translation loading/injection and language-specific runtime branches.
- Added future-language authoring documentation and regression coverage.
- Preserved the coordinated actor-image feature set and all stable IDs and settings.

## 1.2.0

- Added packaged species-image fields and dashboard thumbnails.
- Added GM image replacement through Hunter’s Bestiary’s Foundry FilePicker workflow.
- Synchronized images with D&D Actors and prototype tokens.

## 1.1.5

- Raised the Runyth Hunter's Bestiary dependency floor to 1.3.6 so research-generation results containing Journal Documents use the safe explicit operation-result contract.
- Added a dependency regression check while preserving research-book generation and progress-window behavior.

## 1.1.4

- Research-book generation progress windows now close automatically only after complete success.
- Partial or complete failures keep the progress window open and foregrounded with a cumulative failure list.
- Research-book generation continues with later books after an individual Journal failure when launched from the dashboard.
- Success notifications and dashboard rerenders no longer obscure failed progress reports.
- Raised the Runyth Hunter's Bestiary dependency floor to 1.3.5 for the shared progress-window policy.

## 1.1.3

- Moved the Foundry manifest entry point to a stable root-level `main.mjs`.
- Retained `scripts/main.mjs` as a compatibility entry without duplicate hook registration.
- Added build-time and extracted-archive validation for every manifest-referenced runtime path.
- Fixed installation metadata validation reporting that `scripts/main.mjs` did not exist.

## 1.1.2

- Fixed the settings launcher race that called `bringToFront()` before ApplicationV2 had created its window element.
- Updated the core dependency floor to Runyth Hunter's Bestiary 1.3.3.

## 1.1.1 — 2026-07-31

- Fixed the Configure Settings **Open Dashboard** action on Foundry v13.
- Removed unsupported `minWidth` and `minHeight` properties from the sealed ApplicationV2 position defaults.
- Retained the same effective minimum size through the shared geometry defaults and viewport clamping.
- Added regression coverage preventing non-position fields from entering ApplicationV2 position options.

## 1.1.0 — 2026-07-31

- Normalized the canonical family title and coordinated dependency versions across all four official modules.
- Added/consumed the core naming API with structured validation, registrations, startup warning deduplication, and dashboard-open warnings.
- Added/consumed the shared dashboard toolkit for ApplicationV2 geometry, reset controls, stable search, progress, busy states, operation reporting, and safe destructive confirmations.
- Preserved stable module IDs, existing settings and flags, imported content identities, provider IDs, and documented compatibility aliases.
- Added complete English/German localization parity, developer guidance, migration documentation, tests, and release qualification artifacts.
- Retained this module's ocean-blue ecological palette and module-specific functionality.

## 1.0.1 — 2026-07-31

- Enabled native ApplicationV2 resizing for the Aquatic Ecology Dashboard.
- Persisted the final client-local width, height, and position after moving, resizing, closing, refreshing, or reopening the dashboard.
- Added separate **Reset Size** and **Reset Position** controls under Configure Settings → Module Settings.
- Kept the dashboard toolbar reset action as a combined size-and-position reset.
- Added viewport clamping and regression tests for geometry persistence and independent resets.

## 1.0.0 — 2026-07-30

- Initial system-neutral aquatic ecosystem release with twelve species, public extension API, ApplicationV2 dashboard, complete Runyth Hunter's Bestiary bundles, ecological validation, English/German localization, and deterministic packaging.
