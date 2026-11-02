// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import { MODULE_ID } from "./constants.mjs";
let controlsRegistered = false;
let keybindingRegistered = false;
export function registerIntegrations(open) {
  if (!keybindingRegistered) {
    keybindingRegistered = true;
    game.keybindings.register(MODULE_ID, "openDashboard", { name: "HBAE.Open", editable: [{ key: "KeyA", modifiers: ["Shift"] }], onDown: () => { open(); return true; }, restricted: false });
  }
  if (!controlsRegistered) {
    controlsRegistered = true;
    Hooks.on("getSceneControlButtons", (controls) => {
      const tokenTools = controls?.tokens?.tools;
      if (!tokenTools || tokenTools[`${MODULE_ID}.open`]) return;
      tokenTools[`${MODULE_ID}.open`] = { name: `${MODULE_ID}.open`, title: "HBAE.Open", icon: "fa-solid fa-water", button: true, onChange: () => open() };
    });
  }
}
