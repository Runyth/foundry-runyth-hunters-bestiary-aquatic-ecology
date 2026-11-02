# Hunter's Bestiary: Aquatic Ecology 1.2.3

This patch fixes the Foundry VTT v13 initialization crash caused by assigning `_startupFailures` to the module's frozen public API object. Startup failures are now kept in private module-scoped state and copied into the existing final readiness status.
