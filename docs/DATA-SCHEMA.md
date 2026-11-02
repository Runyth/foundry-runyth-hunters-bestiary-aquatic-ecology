# Data Schema

The package schema is documented in `schemas/ecology.schema.json`; stronger semantic validation lives in `scripts/validation.mjs`. The graph uses shared resource/species node IDs and explicit edges containing type, regions, and months. Localized objects use `{ "en": "...", "de": "..." }`. Stable IDs are global across species, signs, rumors, books, hunts, complications, and harvests.