import type { CanvasDocument, ElementPatch } from "@canvas";

import { isDesignNode, layoutOf, type DesignNode } from "../../core";
import { isFrame } from "../../frame";
import { byIndex } from "./by-index";
import { checkRepeatRules, checkRepeatSource, freeRowName, rowNameProblem } from "./check-repeat";
import { descendants } from "./descendants";
import { renameReferences } from "./rename-references";
import { REPEAT_ERRORS } from "./repeat-errors";
import { renameRepeatPaths } from "./rename-repeat-paths";
import { defaultRepeatKey } from "./default-key";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { addRepeatLayout } from "./repeat-layout";
import { scopeAt } from "./scope-at";
import { templateOf } from "./template-of";
import type { RepeatSettings } from "./repeat.types";
import type { SetRepeatOptions } from "./set-repeat.types";

/** The optional settings: one given (even as `undefined`, which clears it) replaces the stored one. */
const OPTIONAL = ["key", "limit", "designLimit", "previewRow"] as const;

/** The child `template` names, checked: one of the frame's own layers, never a copy. */
function pickTemplate(
  frameName: string,
  children: readonly DesignNode[],
  template: string | undefined,
): DesignNode | null {
  if (template === undefined) return null;
  const child = children.find((el) => el.id === template);
  if (!child || dataCopyTag(child)) {
    throw new Error(`repeat.template: "${template}" isn't one of "${frameName}"'s own layers.`);
  }
  return child;
}

/** Removes a frame's repeat and every copy it made (with what they hold), as one undo step. */
function removeRepeat(doc: CanvasDocument, frameId: string): void {
  // Its copies, and those of its copies in outer copies (`source` is this frame), which the outer
  // iterator's sync then takes the repeat from.
  const all = doc.all();
  const frames = new Set([
    frameId,
    ...all.filter((el) => dataCopyTag(el)?.source === frameId).map((el) => el.id),
  ]);
  const copies = all.filter((el) => {
    const iterator = dataCopyTag(el)?.iterator;
    return (
      isDesignNode(el) && iterator !== undefined && el.parentId === iterator && frames.has(iterator)
    );
  });
  const ids = new Set<string>();
  for (const copy of copies) {
    ids.add(copy.id);
    for (const el of descendants(doc, copy.id)) ids.add(el.id);
  }
  doc.checkpoint();
  doc.batch(() => {
    doc.update(frameId, { repeat: null } as ElementPatch);
    if (ids.size > 0) doc.remove([...ids]);
  });
}

/**
 * Makes a frame an iterator (or changes its repeat), as one undo step: its child repeated (the
 * card) is the one `repeat.template` gives (one of its own layers, not a copy), else the one it
 * repeats now, else its first child. Changing the card is allowed: the sync removes the old
 * card's copies and makes the new one's, in the same step, and `detached` starts empty (unless
 * given), as it does when `source` changes. `repeat` is merged over the stored one, with `as` (a free `item` name by default),
 * empty `filter`, `sort` and `detached`. Everything is checked first, with English errors: a
 * frame with a layer; `source` a list in the frame's scope (a source not readable here passes);
 * a new `as` a name that isn't a brochure placeholder, a source's name or the row name of an
 * iterator around or inside it; the rules' paths, ops and caps. A new repeat or list with no
 * `key` given takes an id-like field of its rows (`defaultRepeatKey`). A changed `as` renames what
 * reads it under the frame (and the repeat's own row paths) in the same step. With `addLayout`,
 * a frame without an auto layout gets a wrapping row. `null` removes the repeat and its copies
 * (and those of its copies in outer copies); the sync writes the copies otherwise. Fields it
 * doesn't know stay as stored; a repeat that comes out the same writes nothing. A copied
 * iterator (one an outer iterator made) is refused: its repeat follows its template's.
 */
export function setRepeat(
  doc: CanvasDocument,
  frameId: string,
  repeat: Partial<RepeatSettings> | null,
  opts: SetRepeatOptions = {},
): void {
  const frame = doc.get(frameId);
  if (!frame || !isFrame(frame)) throw new Error(`"${frameId}" isn't a frame.`);
  if (dataCopyTag(frame)) {
    throw new Error(
      `"${frame.name}" is a copy an outer iterator made. Edit the template's repeat instead.`,
    );
  }
  const stored = (frame as unknown as Record<string, unknown>).repeat;
  if (repeat === null) {
    if (stored != null) removeRepeat(doc, frameId);
    return;
  }
  const current = repeatOf(frame);
  const children = doc
    .all()
    .filter((el): el is DesignNode => isDesignNode(el) && el.parentId === frameId)
    .sort(byIndex);
  const storedTemplate = current ? templateOf(frame, children) : null;
  const template =
    pickTemplate(frame.name, children, repeat.template) ?? templateOf(frame, children);
  if (!template) throw new Error(REPEAT_ERRORS.noLayer);
  // Another card: the sync replaces the old card's copies with the new one's, in this step; the
  // rows detached from the old card start over.
  const switched = storedTemplate !== null && storedTemplate.id !== template.id;
  // Another list: its rows' keys aren't the old list's, so none of them starts detached.
  const relisted =
    current !== null && repeat.source !== undefined && repeat.source !== current.source;

  const as = repeat.as ?? current?.as ?? freeRowName(doc, frameId);
  if (as !== current?.as) {
    const problem = rowNameProblem(doc, frameId, as);
    if (problem) throw new Error(`repeat.as: ${problem}`);
  }
  let next: RepeatSettings = {
    source: repeat.source ?? current?.source ?? "",
    as,
    filter: repeat.filter ?? current?.filter ?? [],
    sort: repeat.sort ?? current?.sort ?? [],
    detached: repeat.detached ?? (switched || relisted ? [] : (current?.detached ?? [])),
    template: template.id,
  };
  for (const field of OPTIONAL) {
    const value = field in repeat ? repeat[field] : current?.[field];
    if (value !== undefined) (next as unknown as Record<string, unknown>)[field] = value;
  }
  const scope = scopeAt(doc, frameId);
  checkRepeatSource(scope, next.source);
  // A new repeat (or a new list) with no key given goes by an id-like field when its rows have one.
  if (next.key === undefined && !("key" in repeat) && (current === null || relisted)) {
    const key = defaultRepeatKey(scope, next);
    if (key !== undefined) next.key = key;
  }
  checkRepeatRules(next);
  if (opts.addLayout && !opts.kinds) {
    throw new Error("setRepeat: adding a layout needs the design's kinds.");
  }
  const renamed = current && current.as !== as ? current.as : null;
  if (renamed) {
    const paths = renameRepeatPaths(next, renamed, as, { source: false, row: true });
    if (paths) next = paths as unknown as RepeatSettings;
  }
  // Fields this version doesn't know stay as stored; an optional one cleared goes.
  const record: Record<string, unknown> = {
    ...(stored !== null && typeof stored === "object" ? stored : {}),
    ...next,
  };
  for (const field of OPTIONAL) if (next[field] === undefined) delete record[field];
  const layout = Boolean(opts.addLayout) && !layoutOf(frame);
  if (!layout && JSON.stringify(record) === JSON.stringify(stored)) return;

  // `addAutoLayout` takes its own checkpoint: holding them keeps everything one undo step.
  const release = doc.holdCheckpoints();
  try {
    if (layout && opts.kinds) addRepeatLayout(doc, frameId, opts.kinds);
    doc.batch(() => {
      doc.update(frameId, { repeat: record } as ElementPatch);
      if (renamed) renameReferences(doc, renamed, as, frameId);
    });
  } finally {
    release();
  }
}
