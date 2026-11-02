# Manual Test Plan — 1.1.3

1. Stop Foundry VTT.
2. Remove any partial `Data/modules/hunters-bestiary-aquatic-ecology` installation.
3. Extract or install `hunters-bestiary-aquatic-ecology-v1.1.3.zip`.
4. Confirm the installed folder contains `module.json`, `main.mjs`, and `scripts/bootstrap.mjs`.
5. Start Foundry and confirm package metadata validation succeeds.
6. Enable Hunter's Bestiary and Aquatic Ecology.
7. Open Configure Settings and launch the Aquatic Ecology dashboard.
8. Confirm the dashboard loads its twelve species and no missing-entry error is logged.
