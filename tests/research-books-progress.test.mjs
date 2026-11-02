// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import test from "node:test";
import assert from "node:assert/strict";
import { generateResearchBooks } from "../scripts/journals.mjs";

function book(id) {
  return {
    id,
    title: { en: id },
    species: [],
    date: "0443-03-03",
    reliability: "tested",
    pages: [{ title: { en: "Page" }, content: { en: "Content" } }]
  };
}

function installGlobals({ failId } = {}) {
  const previous = {
    game: globalThis.game,
    CONST: globalThis.CONST,
    JournalEntry: globalThis.JournalEntry
  };
  globalThis.game = {
    user: { isGM: true },
    i18n: { lang: "en", localize: key => key },
    journal: []
  };
  globalThis.CONST = { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0 } };
  globalThis.JournalEntry = {
    async create(source) {
      if (source.flags["runyth-hunters-bestiary-aquatic-ecology"].managedKey === failId) throw new Error("creation failed");
      return { name: source.name, id: source.name, pages: [] };
    }
  };
  return () => {
    globalThis.game = previous.game;
    globalThis.CONST = previous.CONST;
    globalThis.JournalEntry = previous.JournalEntry;
  };
}

test("dashboard report continues after a failed research book and accumulates progress errors", async () => {
  const restore = installGlobals({ failId: "bad" });
  const progress = [];
  try {
    const report = await generateResearchBooks({ books: [book("first"), book("bad"), book("last")] }, {
      continueOnError: true,
      returnReport: true,
      onProgress: state => progress.push(state)
    });
    assert.equal(report.journals.length, 2);
    assert.equal(report.failed.length, 1);
    assert.equal(report.failed[0].id, "bad");
    assert.match(report.failed[0].message, /bad: creation failed/);
    assert.equal(progress.at(-1).current, 3);
    assert.equal(progress.at(-1).success, 2);
    assert.equal(progress.at(-1).failed, 1);
    assert.equal(progress.at(-1).errors.length, 1);
  } finally {
    restore();
  }
});

test("public generator keeps its original fail-fast array behavior by default", async () => {
  const restore = installGlobals({ failId: "bad" });
  try {
    await assert.rejects(
      generateResearchBooks({ books: [book("bad"), book("last")] }),
      /creation failed/
    );
  } finally {
    restore();
  }
});
