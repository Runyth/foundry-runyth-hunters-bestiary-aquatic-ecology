# Runyth Hunter's Bestiary: Aquatic Ecology

Current release: **1.2.4**. Requires Runyth Hunter's Bestiary 1.4.2 or newer.

## 1.2.0 species-image feature

- Every aquatic species declares a packaged image in `data/ecology.json`.
- Species cards display the effective Runyth Hunter's Bestiary image.
- A GM can click a species picture to open Foundry's standard image FilePicker.
- World-level overrides survive provider re-registration and module updates.
- The same image is consumed by the Aquatic D&D dashboard, Actor portrait, and prototype-token texture.

## Requirements and installation

1. Install and enable Runyth Hunter's Bestiary 1.4.2 or newer.
2. Replace the complete `Data/modules/runyth-runyth-hunters-bestiary-aquatic-ecology` directory with `runyth-runyth-hunters-bestiary-aquatic-ecology-v1.2.4.zip` while Foundry is stopped.
3. Restart Foundry and enter the world as a GM once.

The module remains system-neutral and includes twelve species, 36 signs, 60 rumors, eight research books, staged hunts, 36 harvest materials, a food web, regional data, and the Imperial ecological calendar.

See [`docs/ACTOR-IMAGES.md`](docs/ACTOR-IMAGES.md) for the pre-packed and installed-world workflows.
## Localization

This module uses Foundry VTT’s standard global localization system. Select the active language through Foundry’s **Language Preference** setting; there is no dashboard-specific selector. English is the fallback/default language. See [`docs/LOCALIZATION.md`](docs/LOCALIZATION.md) to add another language.

## Licence

Copyright © 2026  [Daniel Braniewski](https://brani.dev/)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
