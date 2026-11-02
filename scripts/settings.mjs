// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import { MODULE_ID, SETTINGS } from "./constants.mjs";
import { OpenDashboardMenu, ResetDashboardPositionMenu, ResetDashboardSizeMenu } from "./apps/dashboard.mjs";
let registered = false;
export function registerSettings() {
  if (registered) return;
  registered = true;
  game.settings.register(MODULE_ID, SETTINGS.ALLOW_INCOMPLETE, { name: "HBAE.Settings.AllowIncomplete.Name", hint: "HBAE.Settings.AllowIncomplete.Hint", scope: "world", config: true, type: Boolean, default: false, restricted: true });
  game.settings.register(MODULE_ID, SETTINGS.ACCEPTED_INCOMPLETE, { scope: "world", config: false, type: Object, default: {}, restricted: true });
  game.settings.register(MODULE_ID, SETTINGS.GEOMETRY, { scope: "client", config: false, type: Object, default: {} });
  game.settings.register(MODULE_ID, SETTINGS.ACTIVE_TAB, { scope: "client", config: false, type: String, default: "species" });
  game.settings.registerMenu(MODULE_ID, "dashboard", { name: "HBAE.Settings.Dashboard.Name", label: "HBAE.Settings.Dashboard.Label", icon: "fa-solid fa-water", type: OpenDashboardMenu, restricted: false });
  game.settings.registerMenu(MODULE_ID, "resetDashboardSize", { name: "HBAE.Settings.ResetSize.Name", label: "HBAE.Settings.ResetSize.Label", hint: "HBAE.Settings.ResetSize.Hint", icon: "fa-solid fa-expand", type: ResetDashboardSizeMenu, restricted: false });
  game.settings.registerMenu(MODULE_ID, "resetDashboardPosition", { name: "HBAE.Settings.ResetPosition.Name", label: "HBAE.Settings.ResetPosition.Label", hint: "HBAE.Settings.ResetPosition.Hint", icon: "fa-solid fa-crosshairs", type: ResetDashboardPositionMenu, restricted: false });
}
