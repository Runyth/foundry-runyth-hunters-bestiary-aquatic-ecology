# Build Report — Hunter's Bestiary: Aquatic Ecology 1.1.3

## Inputs

- Baseline: 1.1.2 reproducible source ZIP
- Module ID: `hunters-bestiary-aquatic-ecology`
- Foundry compatibility: v13

## Packaging correction

- Manifest runtime entry moved from `scripts/main.mjs` to root-level `main.mjs`.
- `scripts/main.mjs` remains as a compatibility shim.
- Shared initialization resides in `scripts/bootstrap.mjs`, preventing duplicate hook registration.
- The runtime package allowlist explicitly includes root `main.mjs`.
- Package construction fails when any manifest-referenced module, style, or language file is absent.
- Automated tests extract the install ZIP and verify every manifest path against the resulting filesystem.

## Qualification

- Automated tests: 29/29 passed.
- Static validator: passed.
- English/German localization parity: 66/66.
- Repeated build comparison: byte-identical.
- Source ZIP reproduction of install and source archives: byte-identical.
- Safe single archive root and no path traversal: passed.

Live Foundry VTT testing was unavailable and is not claimed.
