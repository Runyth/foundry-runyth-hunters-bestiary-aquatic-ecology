# Hunter's Bestiary: Aquatic Ecology 1.1.3

This patch makes the Foundry runtime entry point explicit at the module root and adds archive-level manifest validation. It addresses installations where Foundry reported that `scripts/main.mjs` was missing even though the accepted source contained it.

## Compatibility

- Foundry VTT 13
- Hunter's Bestiary 1.3.3 or newer
- Stable module ID and content IDs are unchanged

## Manual verification

1. Remove the previously failed or partial installation directory.
2. Install `hunters-bestiary-aquatic-ecology-v1.1.3.zip`.
3. Confirm Foundry accepts the package metadata.
4. Enable the module with Hunter's Bestiary.
5. Open the Aquatic Ecology dashboard from Configure Settings.
