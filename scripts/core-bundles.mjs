// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import { localizeContent } from "./localization.mjs";

export function buildCoreBundles(data) {
  const signs = new Map(data.signs.map((record) => [record.id, record]));
  const rumors = new Map(data.rumors.map((record) => [record.id, record]));
  const books = new Map(data.books.map((record) => [record.id, record]));
  const hunts = new Map(data.hunts.map((record) => [record.id, record]));
  const harvests = new Map(data.harvests.map((record) => [record.id, record]));
  return data.species.map((species) => {
    const monster = {
      id: species.id,
      name: species.commonName,
      img: species.img ?? "modules/hunters-bestiary-aquatic-ecology/assets/aquatic-ecology.svg",
      commonName: species.commonName,
      description: `HBAE.Content.Ecology.species.${species.id.replaceAll("-", "_")}.description`,
      habitat: species.habitat,
      ecology: {
        taxonomy: species.taxonomy,
        anatomy: species.externalAnatomy,
        physiology: species.physiology,
        senses: species.sensoryBiology,
        feeding: species.feedingEcology,
        reproduction: species.reproduction,
        behavior: species.behavior,
        population: species.population,
        disease: species.diseaseAndParasitology,
        humanInteraction: species.humanInteraction,
        relationships: species.relationships
      },
      signs: species.signIds,
      rumors: species.rumorIds,
      books: species.bookIds,
      hunts: species.huntIds,
      harvests: species.harvestIds,
      actorPolicy: species.actorPolicy,
      flags: {
        "runyth-hunters-bestiary-aquatic-ecology": { speciesId: species.id, schemaVersion: data.schemaVersion }
      }
    };
    const bundleSigns = species.signIds.map((id) => signs.get(id));
    const bundleRumors = species.rumorIds.map((id) => rumors.get(id));
    const bundleBooks = species.bookIds.map((id) => books.get(id));
    const bundleHunts = species.huntIds.map((id) => hunts.get(id));
    const bundleHarvests = species.harvestIds.map((id) => harvests.get(id));
    return {
      id: species.id,
      monster,
      monsters: [monster],
      tracks: bundleSigns,
      signs: bundleSigns,
      rumors: bundleRumors,
      books: bundleBooks,
      research: bundleBooks,
      hunt: bundleHunts[0],
      hunts: bundleHunts,
      complications: data.complications,
      harvests: bundleHarvests,
      actorPolicy: species.actorPolicy,
      displayName: localizeContent(species.commonName)
    };
  });
}
