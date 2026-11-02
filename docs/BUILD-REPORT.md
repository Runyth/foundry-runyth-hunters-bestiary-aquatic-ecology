# Build Report 1.2.4

Hunter's Bestiary: Aquatic Ecology 1.2.4 fixes malformed player-visible species references that could become `null` when Hunter's Bestiary knowledge filtering hid a species. The public API now always preserves the stable species ID for a valid packaged species.

Qualification:
- 45/45 automated tests pass.
- Static validation passes for 12 species, 36 signs, 60 rumors, 8 books, 12 hunts, 24 complications, and 36 harvests.
- English/German localization parity is 2407/2407.
- The package uses deterministic ZIP timestamps and ordering.
- No world-data migration is required.

A live Foundry VTT client was not available in the build environment.
