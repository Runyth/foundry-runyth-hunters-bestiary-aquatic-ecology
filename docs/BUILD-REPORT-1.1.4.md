# Build Report — Runyth Hunter's Bestiary: Aquatic Ecology 1.1.4

## Scope

This patch changes the research-book generation progress lifecycle only. It uses the Runyth Hunter's Bestiary 1.3.5 shared progress policy to close on complete success and retain/foreground reports containing failures.

## Qualification

- Automated tests: 32/32 passed.
- English/German localization parity: 67/67 keys.
- Static runtime validation: passed.
- Manifest-referenced source and extracted-install paths: passed.
- Per-book continuation and cumulative failure reporting: covered by automated tests.
- Public API default fail-fast array behavior: preserved and covered by automated tests.
- Deterministic repeated build and extracted-source reproduction: verified during release packaging.
- Live Foundry VTT execution was not available in this build environment.
