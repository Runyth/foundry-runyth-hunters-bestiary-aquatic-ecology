# Runyth Hunter's Bestiary: Aquatic Ecology 1.1.4

This patch normalizes the research-book generation progress window with the Runyth Hunter's Bestiary family standard.

## Behaviour

- A completely successful research-book generation reaches 100% and closes automatically.
- Any failed Journal creation or update keeps the progress window open and foregrounded.
- Individual failures are accumulated and displayed while later books continue processing safely.
- Failed operations do not trigger a success notification or dashboard rerender that could cover the report.

## Compatibility

- Foundry VTT 13
- Runyth Hunter's Bestiary 1.3.5 or newer
- Stable module ID, settings, ecology IDs, Journal provenance, and API defaults are unchanged
