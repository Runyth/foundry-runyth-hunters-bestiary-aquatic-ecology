# Runyth Hunter's Bestiary: Aquatic Ecology 1.2.2

Patch release focused on responsiveness, reduced document and DOM work, safe asynchronous concurrency, and Foundry-specific batching. No gameplay rules, stable IDs, localization keys, public APIs, or user data formats were intentionally changed.

## Changes

- Cached ecology data and deduplicated concurrent fetches.
- Generated independent research books with bounded concurrency, suppressed intermediate directory renders, and retained ordered results and complete failure reporting.
- Reduced repeated localization, image-service, validation, and settings work during dashboard context construction.
- Persisted tab and geometry changes asynchronously without delaying interaction or window close.
- Reused already rendered dashboards instead of forcing a full rerender when only foregrounding was needed.

## Compatibility

Install Runyth Hunter's Bestiary 1.4.2 first. Existing species, research books, image overrides, and dashboard state remain valid.
