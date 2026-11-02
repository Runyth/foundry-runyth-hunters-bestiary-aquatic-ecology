# Performance Audit — Hunter's Bestiary: Aquatic Ecology 1.2.2

## Scope

The complete production source, dashboard lifecycle, data loading, settings persistence, import/update/delete workflows, provider registration, and packaging paths were reviewed for browser responsiveness and Foundry VTT v13 behavior.

## Applied improvements

- Cached ecology data and deduplicated concurrent fetches.
- Generated independent research books with bounded concurrency, suppressed intermediate directory renders, and retained ordered results and complete failure reporting.
- Reduced repeated localization, image-service, validation, and settings work during dashboard context construction.
- Persisted tab and geometry changes asynchronously without delaying interaction or window close.
- Reused already rendered dashboards instead of forcing a full rerender when only foregrounding was needed.

## Deliberately serialized work

Asynchronous concurrency is bounded rather than unlimited. Operations that mutate one shared user record, require atomic provider/world-state replacement, or need precise per-document fallback diagnostics remain serialized. This prevents lost updates, request floods, and non-deterministic partial state while unrelated work proceeds concurrently.

## Browser and Foundry considerations

- Long independent batches use bounded concurrency rather than unbounded `Promise.all`.
- Fallback loops yield periodically so painting and input are not starved.
- Foundry bulk document methods and `render: false` are used where preserving per-document diagnostics allows it.
- Search and progress DOM writes are coalesced instead of triggering repeated synchronous layout work.
- Cached data loaders use a shared in-flight promise and normal browser caching.
- Window-state writes are coalesced and do not delay close animations.

## Regression coverage

- Automated tests: **40/40**
- English/German key parity: **2407/2407**
- New coverage includes concurrency limits, result ordering, shared-fetch deduplication, settings-write races, same-user mutation serialization, batch imports, and parallel dependency readiness where applicable.
