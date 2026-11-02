# Aquatic species images

Each species in `data/ecology.json` has an `img` field. That image is registered with Hunter’s Bestiary and becomes the shared dashboard portrait, imported D&D Actor portrait, and prototype-token texture.

## Pre-packed source workflow

1. Add files under `assets/actors/`, preferably `<species-id>.webp`.
2. Set the species `img` path to `modules/runyth-runyth-hunters-bestiary-aquatic-ecology/assets/actors/<species-id>.webp`.
3. Run the test, validation, and build commands.

## Installed world workflow

A GM can click a species picture in the Aquatic Ecology dashboard. The standard Foundry FilePicker opens and includes upload functionality when permitted. The chosen path is stored by Hunter’s Bestiary as a world override, so it survives re-registration of the bundled ecology data.
