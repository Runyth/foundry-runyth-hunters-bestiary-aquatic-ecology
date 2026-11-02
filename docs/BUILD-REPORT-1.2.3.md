# Build Report 1.2.3

- Baseline: 1.2.2
- Patch: 1.2.3
- Automated tests: 41/41 passed
- Static validation: passed
- Foundry target: 13.351
- Root cause: transient startup failures were assigned to a frozen public API object.
- Correction: private module-scoped startup failure state, copied into the existing ready status.
- World-data migration: none
