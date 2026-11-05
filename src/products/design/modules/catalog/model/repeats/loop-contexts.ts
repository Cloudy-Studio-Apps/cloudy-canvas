import { layerScope, readsUnreadable, type ScopeLayer } from "../../../data";
import type { BrochureRepeat } from "./brochure-repeat.types";
import { DEFAULT_BROCHURE_DESIGN_LIMIT } from "./brochure-repeat.constants";
import { copyPathKey, copySegment } from "./copy-segment";
import { loopNames, loopUnits, repeatSettings } from "./loop-units";
import type { ExpandContext, LoopOwner, LoopUnit } from "./repeat-tree.types";

/** The pass the template shows: the first not detached at or after `wanted`, wrapping round. */
function templatePass(wanted: number, count: number, isDetached: (at: number) => boolean): number {
  for (let step = 0; step < count; step++) {
    const at = (wanted + step) % count;
    if (!isDetached(at)) return at;
  }
  return -1;
}

/**
 * The passes of one loop inside `ctx`, the template's first: while designing it shows the preview
 * row (`previewRow`, clamped; with several rows a page, the page holding it), in an export the
 * first row, so the print follows the rows; either way the first one not detached from there. The
 * other rows follow as copies (path + `copySegment(owner, key)`), made while their place among the
 * copies is within `designLimit` (3 unset) and every loop around is made, all of them in an
 * export; detached copies (their whole path in `detached`) make none. An empty list, or one whose
 * every row is detached, gives the template alone, not printed; a list this device can't read
 * gives the template alone, printed. Pending copies are planned all the same: only `made` differs.
 *
 * Inside a copy of an outer loop, an inner page repeat whose list is empty there gives one pass
 * with the copy's path, `printed: false`: no frame is made for it (only the true template, path
 * `[]`, stays on the canvas).
 */
export function loopContexts(
  repeat: BrochureRepeat,
  owner: LoopOwner,
  ctx: ExpandContext,
  phase: "design" | "export",
): ExpandContext[] {
  const settings = repeatSettings(repeat);
  const { perPage } = owner;
  const units = loopUnits(settings, ctx.scope, perPage);
  const names = loopNames(ctx.scope, settings, perPage);
  const count = units.length;
  // A list this device can't read: its names read as unreadable, so what reads them is left alone.
  const unreadable = readsUnreadable(ctx.scope, settings.source);
  const pathOf = (unit: LoopUnit) => [...ctx.path, copySegment(owner.id, unit.key)];
  const detached = new Set(repeat.detached);
  const isDetached = (at: number) => {
    const unit = units[at];
    return !unit || detached.has(copyPathKey(pathOf(unit)));
  };

  const enter = (
    unit: LoopUnit | null,
    path: readonly string[],
    made: boolean,
    printed: boolean,
  ): ExpandContext => {
    const value = unit ? unit.value : perPage > 1 ? [] : undefined;
    const index = unit?.index ?? 0;
    const layer: ScopeLayer = {
      name: settings.as,
      value,
      owner: owner.id,
      label: owner.label,
      index,
      count,
      names,
      ...(unreadable ? { unreadable: true } : {}),
    };
    return {
      scope: layerScope(ctx.scope, layer),
      layers: [...ctx.layers, layer],
      path,
      made,
      printed,
    };
  };

  const wanted = phase === "export" ? 0 : Math.floor((repeat.previewRow ?? 0) / perPage);
  const clamped = Math.min(Math.max(Number.isFinite(wanted) ? wanted : 0, 0), count - 1);
  const preview = count === 0 ? -1 : templatePass(clamped, count, isDetached);
  const shown = units[preview];
  // A list this device can't read isn't empty: the template prints as it is (and the copies made
  // elsewhere are kept, `syncBrochureRepeats`). Only a readable list with no row prints nothing.
  if (!shown) return [enter(null, ctx.path, ctx.made, unreadable && ctx.printed)];
  const out = [enter(shown, ctx.path, ctx.made, ctx.printed)];
  const limit = repeat.designLimit ?? DEFAULT_BROCHURE_DESIGN_LIMIT;
  let copies = 0;
  units.forEach((unit, at) => {
    if (at === preview || isDetached(at)) return;
    copies++;
    const made = phase === "export" || (ctx.made && copies <= limit);
    out.push(enter(unit, pathOf(unit), made, ctx.printed));
  });
  return out;
}
