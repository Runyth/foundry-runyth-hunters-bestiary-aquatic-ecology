// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
import { MODULE_ID } from "./constants.mjs";
import { localizeContent } from "./localization.mjs";

function requireGm() {
  if (!game.user?.isGM) throw new Error(game.i18n.localize("HBAE.Error.GMOnly"));
}
function pageSource(page, bookId, index) {
  return {
    name: localizeContent(page.title),
    type: "text",
    sort: index * 100000,
    text: { content: `<section class="hbae-journal"><p>${localizeContent(page.content)}</p></section>`, format: 1 },
    flags: { [MODULE_ID]: { managed: true, key: `${bookId}:page:${index}` } }
  };
}

export async function generateResearchBooks(data, {
  update = true,
  onProgress,
  continueOnError = false,
  returnReport = false
} = {}) {
  requireGm();
  const total = data.books.length;
  const journalsByIndex = new Array(total);
  const failed = [];
  const existingByKey = new Map((game.journal?.contents ?? []).map(entry => [entry.getFlag(MODULE_ID, "managedKey"), entry]));
  let completed = 0;
  let success = 0;

  await mapWithConcurrency(data.books, async (book, index) => {
    const displayName = localizeContent(book.title) || book.id;
    try {
      const existing = existingByKey.get(book.id) ?? null;
      const source = {
        name: displayName,
        ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
        flags: { [MODULE_ID]: { managed: true, managedKey: book.id, speciesIds: book.species, date: book.date, reliability: book.reliability } }
      };
      let journal = existing;
      if (!journal) {
        journal = await JournalEntry.create({ ...source, pages: book.pages.map((page, pageIndex) => pageSource(page, book.id, pageIndex)) }, { render: false });
      } else if (update) {
        await journal.update(source, { render: false });
        const managedIds = journal.pages.filter(page => page.getFlag(MODULE_ID, "managed")).map(page => page.id);
        if (managedIds.length) await journal.deleteEmbeddedDocuments("JournalEntryPage", managedIds, { render: false });
        const pages = book.pages.map((page, pageIndex) => pageSource(page, book.id, pageIndex));
        if (pages.length) await journal.createEmbeddedDocuments("JournalEntryPage", pages, { render: false });
      }
      journalsByIndex[index] = journal;
      success += 1;
      return journal;
    } catch (error) {
      const failure = {
        operation: "failed",
        type: "JournalEntry",
        id: book.id,
        name: displayName,
        message: `${displayName}: ${error?.message ?? String(error)}`,
        error
      };
      failed.push(failure);
      if (!continueOnError) throw error;
      return null;
    } finally {
      completed += 1;
      onProgress?.({
        current: completed,
        total,
        phase: "research-books",
        label: displayName,
        success,
        failed: failed.length,
        errors: failed
      });
    }
  }, { concurrency: continueOnError ? 3 : 1 });

  const journals = journalsByIndex.filter(Boolean);
  if (returnReport) {
    return {
      operation: "generate-research-books",
      journals,
      failed,
      processed: total,
      success: journals.length,
      total
    };
  }
  return journals;
}

async function mapWithConcurrency(values, worker, { concurrency = 3 } = {}) {
  const items = Array.from(values ?? []);
  const limit = Math.max(1, Math.min(items.length || 1, Math.trunc(Number(concurrency) || 1)));
  let cursor = 0;
  const run = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: limit }, () => run()));
}
