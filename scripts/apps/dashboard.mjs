import { CORE_ID, MODULE_ID, SETTINGS } from "../constants.mjs";
import { loadEcologyData } from "../data.mjs";
import { validateEcologyPackage } from "../validation.mjs";
import { getProviderStatus } from "../registry.mjs";
import { generateResearchBooks } from "../journals.mjs";
import { localizeContent } from "../localization.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const DEFAULT_GEOMETRY = Object.freeze({ width: 1080, height: 760, minWidth: 720, minHeight: 520 });
const DEFAULT_POSITION = Object.freeze({ width: DEFAULT_GEOMETRY.width, height: DEFAULT_GEOMETRY.height });
const GEOMETRY_OPTIONS = Object.freeze({ moduleId: MODULE_ID, settingKey: SETTINGS.GEOMETRY, applicationId: "hbae-dashboard", mapped: false, defaults: DEFAULT_GEOMETRY });

function toolkit() {
  const value = game.modules.get(CORE_ID)?.api?.ui;
  if (!value) throw new Error("Runyth Hunter's Bestiary dashboard API 1.0.0 is unavailable.");
  return value;
}


function requireGm() {
  if (game.user?.isGM) return true;
  ui.notifications.error(game.i18n.localize("HBAE.Error.GMOnly"));
  return false;
}

export class AquaticEcologyDashboard extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "hbae-dashboard",
    tag: "section",
    classes: ["hbae-app", "hb-shared-dashboard"],
    window: { title: "HBAE.Title", icon: "fa-solid fa-water", frame: true, positioned: true, minimizable: true, resizable: true },
    position: DEFAULT_POSITION,
    actions: {
      hbaeValidate: this.#validate,
      hbaeGenerateBooks: this.#generateBooks,
      hbaeExport: this.#export,
      hbaeResetSize: this.#resetSize,
      hbaeResetPosition: this.#resetPosition,
      hbaeChangeImage: this.#changeImage
    }
  };

  static PARTS = { main: { template: `modules/${MODULE_ID}/templates/dashboard.hbs` } };

  #controller = null;
  #search = null;
  #geometry = null;
  #activeTab = "species";
  #query = "";

  constructor(options = {}) {
    super(options);
    this.#activeTab = options.initialTab ?? game.settings.get(MODULE_ID, SETTINGS.ACTIVE_TAB) ?? "species";
  }

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this.setPosition(toolkit().loadGeometry(GEOMETRY_OPTIONS));
  }

  async _prepareContext() {
    const data = await loadEcologyData();
    const isGM = game.user.isGM;
    const visibleSpecies = isGM ? data.species : await game.modules.get(MODULE_ID).api.getSpecies();
    const imageApi = game.modules.get(CORE_ID)?.api;
    const validation = isGM ? validateEcologyPackage(data, { strict: true }) : { valid: true, issues: [] };
    return {
      isGM,
      activeTab: this.#activeTab,
      tabs: [
        ["species", "HBAE.Tab.Species"], ["ecosystem", "HBAE.Tab.Ecosystem"], ["regions", "HBAE.Tab.Regions"],
        ["calendar", "HBAE.Tab.Calendar"], ["signs", "HBAE.Tab.Signs"], ["rumors", "HBAE.Tab.Rumors"],
        ["books", "HBAE.Tab.Books"], ["hunts", "HBAE.Tab.Hunts"], ["providers", "HBAE.Tab.Providers"],
        ["validation", "HBAE.Tab.Validation"]
      ].filter(([id]) => isGM || ["species", "regions", "calendar"].includes(id)).map(([id, label]) => ({ id, label: game.i18n.localize(label), active: id === this.#activeTab })),
      species: visibleSpecies.map(record => {
        const displayName = localizeContent(record.commonName) || record.name || record.id;
        const ecologicalRole = localizeContent(record.ecologicalRole);
        const regions = record.habitat?.regions ?? [];
        return {
          ...record,
          displayName,
          image: imageApi?.getMonsterImage?.(record.id)?.imagePath ?? record.img ?? "modules/hunters-bestiary-aquatic-ecology/assets/aquatic-ecology.svg",
          summary: localizeContent(record.externalAnatomy?.bodyPlan ?? record.description) || "",
          regionsText: regions.join(", "),
          ecologicalRole,
          scholarlyName: record.scholarlyName ?? "",
          habitat: record.habitat ?? {},
          actorPolicy: isGM ? record.actorPolicy : undefined,
          searchText: `${displayName} ${ecologicalRole} ${regions.join(" ")}`.toLocaleLowerCase()
        };
      }),
      signs: isGM ? data.signs.map(record => {
        const displayName = localizeContent(record.name);
        const descriptionText = localizeContent(record.description);
        return { ...record, displayName, descriptionText, persistenceText: localizeContent(record.persistence), searchText: `${displayName} ${descriptionText}`.toLocaleLowerCase() };
      }) : [],
      rumors: isGM ? data.rumors.map(record => {
        const textValue = localizeContent(record.text);
        return { ...record, textValue, searchText: `${textValue} ${record.classification}`.toLocaleLowerCase() };
      }) : [],
      books: isGM ? data.books.map(record => {
        const displayTitle = localizeContent(record.title);
        const authorText = localizeContent(record.author);
        return { ...record, displayTitle, authorText, biasText: localizeContent(record.bias), searchText: `${displayTitle} ${authorText}`.toLocaleLowerCase() };
      }) : [],
      hunts: isGM ? data.hunts.map(record => {
        const displayName = localizeContent(record.name);
        const objectiveText = localizeContent(record.objective);
        return { ...record, displayName, objectiveText, stages: (record.stages ?? []).map(stage => ({ ...stage, displayName: localizeContent(stage.name) })), searchText: `${displayName} ${objectiveText}`.toLocaleLowerCase() };
      }) : [],
      regions: Object.entries(data.regionalDistribution.regions).map(([id, record]) => {
        const displayName = localizeContent(record.name);
        const habitats = localizeContent(record.habitats ?? []);
        return { id, ...record, displayName, habitatsText: habitats.join(", "), salinity: localizeContent(record.salinity), temperature: localizeContent(record.temperature), connections: localizeContent(record.connections), searchText: `${displayName} ${habitats.join(" ")}`.toLocaleLowerCase() };
      }),
      calendar: data.seasonalCalendar.map(entry => ({ ...entry, phase: localizeContent(entry.phase), events: localizeContent(entry.events ?? []) })),
      foodNodes: isGM ? data.foodWeb.nodes : [],
      foodEdges: isGM ? data.foodWeb.edges : [],
      providers: isGM ? getProviderStatus() : [],
      validation,
      validationJson: isGM ? JSON.stringify(validation, null, 2) : "",
      query: this.#query
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#controller?.abort();
    this.#controller = new AbortController();
    const signal = this.#controller.signal;
    this.#geometry ??= toolkit().createGeometryPersistence(this, GEOMETRY_OPTIONS);
    this.element?.addEventListener("pointerup", () => this.#geometry.schedule(), { signal });
    for (const button of this.element?.querySelectorAll("[data-hbae-tab]") ?? []) {
      button.addEventListener("click", () => {
        this.#activeTab = button.dataset.hbaeTab;
        void game.settings.set(MODULE_ID, SETTINGS.ACTIVE_TAB, this.#activeTab)
          .catch(error => console.error(`${MODULE_ID} | Active-tab persistence failed`, error));
        this.render({ force: true });
      }, { signal });
    }
    this.#search?.destroy();
    this.#search = toolkit().bindStableSearch(this.element, {
      inputSelector: "[data-hbae-search]",
      entrySelector: "[data-hbae-record]",
      emptySelector: "[data-hbae-empty]",
      query: this.#query,
      onQuery: query => { this.#query = query; }
    });
  }

  setPosition(position = {}) {
    const result = super.setPosition(position);
    if (this.rendered) this.#geometry?.schedule();
    return result;
  }

  async _preClose(options) {
    this.#controller?.abort();
    this.#search?.destroy();
    const geometry = this.#geometry;
    this.#geometry = null;
    let persistence;
    try { persistence = geometry?.flush(); } catch (error) { console.error(`${MODULE_ID} | Window-state persistence failed`, error); }
    geometry?.destroy();
    if (persistence) void Promise.resolve(persistence).catch(error => console.error(`${MODULE_ID} | Window-state persistence failed`, error));
    return super._preClose(options);
  }

  static async #changeImage(_event, target) {
    if (!requireGm()) return;
    const monsterId = target.dataset.monsterId;
    if (!monsterId) return;
    return game.modules.get(CORE_ID)?.api?.openMonsterImagePicker?.(monsterId, {
      onSelected: async () => {
        ui.notifications.info(game.i18n.localize("HBAE.Notification.ImageUpdated"));
        await this.render({ force: true });
      }
    });
  }

  static async #validate() {
    if (!requireGm()) return;
    const report = validateEcologyPackage(await loadEcologyData(), { strict: true });
    ui.notifications[report.valid ? "info" : "error"](game.i18n.format("HBAE.Notification.Validation", { issues: report.issues.length }));
    this.render({ force: true });
  }

  static async #generateBooks() {
    if (!requireGm()) return;
    const report = await toolkit().runProgressOperation({
      title: game.i18n.localize("HBAE.Progress"),
      root: this.element,
      autoCloseOnSuccess: true,
      foregroundOnFailure: true,
      runner: async onProgress => generateResearchBooks(await loadEcologyData(), {
        onProgress,
        continueOnError: true,
        returnReport: true
      })
    });
    if (report.failed.length) {
      ui.notifications.error(game.i18n.format("HBAE.Notification.BooksGeneratedWithFailures", {
        count: report.journals.length,
        failed: report.failed.length
      }));
      return;
    }
    ui.notifications.info(game.i18n.format("HBAE.Notification.BooksGenerated", { count: report.journals.length }));
    this.render({ force: true });
  }

  static async #export() {
    if (!requireGm()) return;
    const data = JSON.stringify(await loadEcologyData(), null, 2);
    foundry.utils.saveDataToFile(data, "application/json", `aquatic-ecology-${Date.now()}.json`);
  }

  static async #resetSize() { await resetAquaticDashboardSize(); }
  static async #resetPosition() { await resetAquaticDashboardPosition(); }
}

let instance;

async function applyGeometry(operation, notificationKey) {
  const geometry = await operation(GEOMETRY_OPTIONS);
  if (instance?.rendered) instance.setPosition(geometry);
  ui.notifications.info(game.i18n.localize(notificationKey));
  return geometry;
}

export function resetAquaticDashboardSize() {
  return applyGeometry(toolkit().resetSize, "HBAE.Notification.SizeReset");
}

export function resetAquaticDashboardPosition() {
  return applyGeometry(toolkit().resetPosition, "HBAE.Notification.PositionReset");
}

export async function resetAquaticDashboardGeometry() {
  await resetAquaticDashboardSize();
  return resetAquaticDashboardPosition();
}

const SettingsApplication = globalThis.foundry?.applications?.api?.ApplicationV2 ?? class {};
class ImmediateSettingsAction extends SettingsApplication {
  static async execute() {}
  async render() { await this.constructor.execute(); return this; }
}
export class OpenDashboardMenu extends ImmediateSettingsAction { static execute() { return openAquaticDashboard(); } }
export class ResetDashboardSizeMenu extends ImmediateSettingsAction { static execute() { return resetAquaticDashboardSize(); } }
export class ResetDashboardPositionMenu extends ImmediateSettingsAction { static execute() { return resetAquaticDashboardPosition(); } }

export function openAquaticDashboard(options = {}) {
  const core = game.modules.get(CORE_ID)?.api;
  core?.ui?.validateDashboardModuleName?.({
    moduleId: MODULE_ID,
    currentTitle: game.modules.get(MODULE_ID)?.title,
    subject: "Aquatic Ecology",
    type: "subject",
    dashboardApplicationId: "hbae-dashboard",
    providerId: MODULE_ID,
    version: game.modules.get(MODULE_ID)?.version,
    apiCompatibilityVersion: "1.0.0"
  });
  if (instance?.rendered && !options.initialTab) {
    instance.bringToFront?.();
    return instance;
  }
  instance ??= new AquaticEcologyDashboard(options);
  if (options.initialTab && !instance.rendered) instance = new AquaticEcologyDashboard(options);
  const rendered = instance.render({ force: true });
  Promise.resolve(rendered).then(() => {
    if (instance?.rendered && instance.element) instance.bringToFront?.();
  }).catch(error => console.error(`${MODULE_ID} | Dashboard render failed`, error));
  return instance;
}
