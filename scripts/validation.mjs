// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
const REQUIRED_SPECIES = [
  "commonName", "taxonomy", "externalAnatomy", "physiology", "sensoryBiology",
  "feedingEcology", "reproduction", "behavior", "habitat", "population",
  "diseaseAndParasitology", "humanInteraction", "relationships", "actorPolicy"
];
function issue(code, path, message, severity = "error") {
  return { code, path, message, severity };
}
function hasLocalizable(value) {
  if (typeof value === "string") return Boolean(value.trim());
  if (Array.isArray(value)) return value.length > 0 && value.every(hasLocalizable);
  if (!value || typeof value !== "object") return false;
  if (typeof value.key === "string" && value.key.trim()) return true;
  return Object.values(value).some(entry => typeof entry === "string" && entry.trim());
}
function rangesOverlap(a = [], b = []) { return a.length === 2 && b.length === 2 && Math.max(a[0], b[0]) <= Math.min(a[1], b[1]); }

export function validateEcologyPackage(data, { strict = true } = {}) {
  const issues = [];
  if (!data || typeof data !== "object") return { valid: false, complete: false, issues: [issue("E_PACKAGE", "$", "Package must be an object.")] };
  const collections = ["species", "signs", "rumors", "books", "hunts", "complications", "harvests", "seasonalCalendar"];
  for (const key of collections) if (!Array.isArray(data[key])) issues.push(issue("E_COLLECTION", key, `${key} must be an array.`));
  if (!data.foodWeb?.nodes || !data.foodWeb?.edges) issues.push(issue("E_FOOD_WEB", "foodWeb", "Food web nodes and edges are required."));
  if (!data.regionalDistribution?.regions) issues.push(issue("E_REGIONS", "regionalDistribution", "Regional distribution is required."));
  if (issues.length) return { valid: false, complete: false, issues };

  const idCollections = collections.filter((key) => key !== "seasonalCalendar");
  const allIds = new Map();
  for (const key of idCollections) {
    data[key].forEach((record, index) => {
      if (!record?.id) issues.push(issue("E_ID_MISSING", `${key}[${index}]`, "Stable id is required."));
      else if (allIds.has(record.id)) issues.push(issue("E_ID_DUPLICATE", `${key}[${index}].id`, `Duplicate stable id ${record.id}.`));
      else allIds.set(record.id, key);
    });
  }
  const speciesById = new Map(data.species.map((record) => [record.id, record]));
  const signIds = new Set(data.signs.map((record) => record.id));
  const rumorIds = new Set(data.rumors.map((record) => record.id));
  const bookIds = new Set(data.books.map((record) => record.id));
  const huntIds = new Set(data.hunts.map((record) => record.id));
  const complicationIds = new Set(data.complications.map((record) => record.id));
  const harvestIds = new Set(data.harvests.map((record) => record.id));
  const regionIds = new Set(Object.keys(data.regionalDistribution.regions));
  const foodNodeIds = new Set(data.foodWeb.nodes.map((record) => record.id));

  for (const [index, species] of data.species.entries()) {
    for (const key of REQUIRED_SPECIES) if (species[key] === undefined) issues.push(issue("E_SPECIES_FIELD", `species[${index}].${key}`, `Required ecological field ${key} is missing.`));
    if (!Array.isArray(species.signIds) || species.signIds.length < 2) issues.push(issue("E_SIGNS_MIN", `species[${index}].signIds`, "Every species needs multiple signs."));
    if (!Array.isArray(species.rumorIds) || species.rumorIds.length < 5) issues.push(issue("E_RUMORS_MIN", `species[${index}].rumorIds`, "Every species needs five rumor layers."));
    if (!species.bookIds?.length) issues.push(issue("E_BOOK_REQUIRED", `species[${index}].bookIds`, "Every species needs a research source."));
    if (!species.huntIds?.length) issues.push(issue("E_HUNT_REQUIRED", `species[${index}].huntIds`, "Every species needs a hunt."));
    if (!species.actorPolicy?.required && !species.actorPolicy?.reason) issues.push(issue("E_ACTOR_POLICY", `species[${index}].actorPolicy`, "Explicit Actor policy is required."));
    for (const id of species.signIds || []) if (!signIds.has(id)) issues.push(issue("E_SIGN_REF", `species[${index}].signIds`, `Missing sign ${id}.`));
    for (const id of species.rumorIds || []) if (!rumorIds.has(id)) issues.push(issue("E_RUMOR_REF", `species[${index}].rumorIds`, `Missing rumor ${id}.`));
    for (const id of species.bookIds || []) if (!bookIds.has(id)) issues.push(issue("E_BOOK_REF", `species[${index}].bookIds`, `Missing book ${id}.`));
    for (const id of species.huntIds || []) if (!huntIds.has(id)) issues.push(issue("E_HUNT_REF", `species[${index}].huntIds`, `Missing hunt ${id}.`));
    for (const id of species.harvestIds || []) if (!harvestIds.has(id)) issues.push(issue("E_HARVEST_REF", `species[${index}].harvestIds`, `Missing harvest ${id}.`));
    for (const region of species.habitat?.regions || []) if (!regionIds.has(region)) issues.push(issue("E_REGION_REF", `species[${index}].habitat.regions`, `Missing region ${region}.`));
    for (const prey of species.relationships?.prey || []) if (!foodNodeIds.has(prey)) issues.push(issue("E_PREY_REF", `species[${index}].relationships.prey`, `Diet references nonexistent resource or species ${prey}.`));
    const predatorIds = (species.relationships?.predators || []).filter((id) => speciesById.has(id));
    for (const predatorId of predatorIds) {
      const predator = speciesById.get(predatorId);
      const regionOverlap = species.habitat.regions.some((region) => predator.habitat.regions.includes(region));
      if (!regionOverlap) issues.push(issue("E_RANGE_DISJOINT", `species[${index}].relationships.predators`, `${species.id} and predator ${predatorId} never overlap.`));
      if (!rangesOverlap(species.habitat.salinityPpt, predator.habitat.salinityPpt)) issues.push(issue("E_SALINITY_DISJOINT", `species[${index}].relationships.predators`, `${species.id} and predator ${predatorId} have disjoint salinity tolerance.`));
    }
    for (const month of species.reproduction?.breedingMonths || []) if (!species.habitat.seasonalMonths.includes(month)) issues.push(issue("E_BREEDING_SEASON", `species[${index}].reproduction.breedingMonths`, `Breeding month ${month} is outside seasonal presence.`));
  }

  for (const [index, rumor] of data.rumors.entries()) for (const id of rumor.speciesIds || []) if (!speciesById.has(id)) issues.push(issue("E_RUMOR_SPECIES", `rumors[${index}]`, `Rumor references missing species ${id}.`));
  for (const [index, sign] of data.signs.entries()) for (const id of sign.speciesIds || []) if (!speciesById.has(id)) issues.push(issue("E_SIGN_SPECIES", `signs[${index}]`, `Sign references missing species ${id}.`));
  for (const [index, book] of data.books.entries()) for (const id of book.species || []) if (!speciesById.has(id)) issues.push(issue("E_BOOK_SPECIES", `books[${index}]`, `Book references missing species ${id}.`));
  for (const [index, hunt] of data.hunts.entries()) {
    if (!speciesById.has(hunt.speciesId)) issues.push(issue("E_HUNT_SPECIES", `hunts[${index}]`, `Hunt references missing species ${hunt.speciesId}.`));
    for (const stage of hunt.stages || []) {
      for (const id of stage.requiredSignIds || []) if (!signIds.has(id)) issues.push(issue("E_HUNT_SIGN", `hunts[${index}]`, `Hunt references missing sign ${id}.`));
      for (const id of stage.requiredRumorIds || []) if (!rumorIds.has(id)) issues.push(issue("E_HUNT_RUMOR", `hunts[${index}]`, `Hunt references missing rumor ${id}.`));
      for (const id of stage.requiredBookIds || []) if (!bookIds.has(id)) issues.push(issue("E_HUNT_BOOK", `hunts[${index}]`, `Hunt references missing book ${id}.`));
      for (const id of stage.requiredComplicationIds || []) if (!complicationIds.has(id)) issues.push(issue("E_HUNT_COMPLICATION", `hunts[${index}]`, `Hunt references missing complication ${id}.`));
    }
  }
  for (const [index, harvest] of data.harvests.entries()) {
    if (!speciesById.has(harvest.speciesId)) issues.push(issue("E_HARVEST_SPECIES", `harvests[${index}]`, `Harvest references missing species ${harvest.speciesId}.`));
    if (!hasLocalizable(harvest.sourceAnatomy)) issues.push(issue("E_HARVEST_ANATOMY", `harvests[${index}].sourceAnatomy`, "Harvest material lacks source anatomy."));
  }
  for (const [index, edge] of data.foodWeb.edges.entries()) {
    if (!foodNodeIds.has(edge.from) || !foodNodeIds.has(edge.to)) issues.push(issue("E_EDGE_REF", `foodWeb.edges[${index}]`, "Food-web edge references a missing node."));
    if (!edge.regions?.length) issues.push(issue("E_EDGE_RANGE", `foodWeb.edges[${index}]`, "Ecological relationship has no overlapping region."));
    if (!edge.months?.length) issues.push(issue("E_EDGE_SEASON", `foodWeb.edges[${index}]`, "Ecological relationship has no seasonal overlap."));
  }
  const errors = issues.filter((entry) => entry.severity === "error");
  return { valid: errors.length === 0 || !strict, complete: errors.length === 0, issues, counts: Object.fromEntries(collections.map((key) => [key, data[key].length])) };
}
