import {
  TokenStore,
  type CanvasDocument,
  type CanvasElement,
  type EditedChange,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import { DESIGN_TOKEN_CONTEXT } from "../../core";
import {
  buildSheet,
  generatedMark,
  groupKey,
  isSheet,
  reconcileSheet,
  safeGroups,
  sheetContext,
  type SheetFrame,
  type SystemPage,
} from "../sheet";
import { hashText } from "../tokens";
import { ensureSystemPage } from "./ensure-system-page";
import { stackSystemSheets } from "./stack-system-sheets";
import type { StyleguideSources } from "./sync-styleguide.types";
import { isSystemPage, settingsOf } from "./system-page";

/** Bumped when reconciling changes (children sort after their parent; keys are paths). */
const RECONCILE_VERSION = 3;

/** Fields auto layout writes on generated layers (not an edit to repair). */
const GEOMETRY = new Set(["x", "y", "w", "h"]);

/** Whether the edit could change what any sheet shows, or the system page. */
function relevant(doc: CanvasDocument, change: EditedChange): boolean {
  if (change.tokens.size > 0 || change.meta) return true;
  for (const before of change.before.values()) if ("variableModes" in before) return true;
  for (const id of change.updated) {
    const el = doc.get(id);
    if (isSheet(el) || isSystemPage(el) || generatedMark(el)) return true;
  }
  return change.removed.some((el) => isSheet(el) || generatedMark(el) !== null);
}

/**
 * Keeps the Design system up to date, as an `afterEdit` hook (inside the edit's undo step): the
 * system page and its category sheets, then the content of every sheet the edit could change,
 * written only when it differs from what was last generated (its hash), then the system page's
 * sheets stacked. Looking at the view never runs it: only edits do.
 */
export function syncStyleguide(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
  sources: StyleguideSources,
): void {
  if (!relevant(doc, change)) return;
  const store = TokenStore.of(doc);
  const categories = sources.categories();
  const page = ensureSystemPage(doc, store, categories);
  const everything = change.tokens.size > 0 || change.meta || (page && change.updated.has(page.id));
  const modesChanged = [...change.before.values()].some((before) => "variableModes" in before);
  const touched = new Set<string>();
  // Sheets whose generated layers were changed by something else than auto layout's moves (a
  // hand edit, an agent, a delete): they're written again even when their content didn't change.
  const repair = new Set<string>();
  for (const id of change.updated) {
    const el = doc.get(id);
    const mark = generatedMark(el);
    touched.add(mark ? mark.sheet : id);
    const fields = Object.keys(change.before.get(id) ?? {});
    if (mark && fields.some((field) => !GEOMETRY.has(field))) repair.add(mark.sheet);
  }
  for (const el of change.removed) {
    const mark = generatedMark(el);
    if (mark) {
      touched.add(mark.sheet);
      repair.add(mark.sheet);
    }
  }

  const all = doc.all();
  const generated = new Map<string, CanvasElement[]>();
  for (const el of all) {
    const mark = generatedMark(el);
    if (mark) generated.set(mark.sheet, [...(generated.get(mark.sheet) ?? []), el]);
  }
  const context = sheetContext(doc, store);
  const settings = settingsOf(page);
  for (const sheet of all.filter(isSheet)) {
    if (!everything && !modesChanged && !touched.has(sheet.id)) continue;
    const current = doc.get(sheet.id);
    if (!isSheet(current)) continue;
    regenerate(doc, kinds, current, page, generated.get(sheet.id) ?? [], {
      sources,
      store,
      settings,
      context,
      force: repair.has(sheet.id),
    });
  }
  if (page) stackSystemSheets(doc, page, categories);
}

/** Builds one sheet's content and writes it when its hash changed. */
function regenerate(
  doc: CanvasDocument,
  kinds: ElementKinds,
  sheet: SheetFrame,
  page: SystemPage | undefined,
  existing: readonly CanvasElement[],
  input: {
    sources: StyleguideSources;
    store: TokenStore;
    settings: ReturnType<typeof settingsOf>;
    context: Parameters<typeof buildSheet>[0]["context"];
    /** Write it even when its content's hash didn't change (its layers were edited). */
    force: boolean;
  },
): void {
  const category = input.sources.categories().find((c) => c.id === sheet.sheet.category);
  if (!category) return;
  const onSystem = page !== undefined && sheet.pageId === page.id;
  const groups = safeGroups(category, input.store, doc);
  const hiddenGroups = new Set(
    onSystem
      ? groups
          .filter((group) => input.settings.hidden.includes(groupKey(category.id, group.id)))
          .map((group) => group.id)
      : [],
  );
  const specs = buildSheet({
    sheet: sheet.sheet,
    category,
    groups,
    settings: input.settings,
    hiddenGroups,
    modeView: onSystem ? input.settings.modeView : sheet.sheet.modeView,
    templates: input.sources.template,
    context: input.context,
    modes: DESIGN_TOKEN_CONTEXT.modesOf(doc, sheet),
  });
  // The version makes every sheet write itself again once when how it's written changes.
  const hash = hashText(`${RECONCILE_VERSION}:${JSON.stringify(specs)}`);
  if (hash === sheet.sheet.hash && !input.force) return;
  reconcileSheet(doc, kinds, sheet, specs, existing, {
    options: input.sources.options(),
    store: input.store,
  });
  if (hash !== sheet.sheet.hash) {
    doc.update(sheet.id, { sheet: { ...sheet.sheet, hash } } as ElementPatch);
  }
}
