import { rowScope, type ScopeLayer } from "../../../data";
import type { BrochureRepeat } from "./brochure-repeat.types";
import { DEFAULT_BROCHURE_DESIGN_LIMIT } from "./brochure-repeat.constants";
import { loopNames, loopUnits, repeatSettings } from "./loop-units";
import type { ExpandContext, LoopOwner, LoopUnit } from "./repeat-tree.types";

/**
 * The passes of one loop inside `ctx`, the template's first: while designing it shows the preview
 * row (`previewRow`, clamped; with several rows a page, the page holding it), in an export the
 * first row, so the print follows the rows. The other rows follow as copies (path + their key),
 * made while their place among the copies is within `designLimit` (3 unset) and every loop around
 * is made, all of them in an export; detached keys make none. An empty list gives the template
 * alone, not printed. Pending copies are planned all the same: only `made` differs.
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

  const enter = (unit: LoopUnit | null, path: string[], made: boolean, printed: boolean) => {
    const value = unit ? unit.value : perPage > 1 ? [] : undefined;
    const index = unit?.index ?? 0;
    const layer: ScopeLayer = {
      name: settings.as,
      value,
      owner: owner.id,
      label: owner.label,
      index,
      count,
    };
    return {
      scope: rowScope(ctx.scope, settings, value, index, count, names),
      layers: [...ctx.layers, layer],
      path,
      made,
      printed,
    };
  };

  if (count === 0) return [enter(null, ctx.path, ctx.made, false)];
  const wanted = phase === "export" ? 0 : Math.floor((repeat.previewRow ?? 0) / perPage);
  const preview = Math.min(Math.max(Number.isFinite(wanted) ? wanted : 0, 0), count - 1);
  const out = [enter(units[preview] ?? null, ctx.path, ctx.made, ctx.printed)];
  const detached = new Set(repeat.detached);
  const limit = repeat.designLimit ?? DEFAULT_BROCHURE_DESIGN_LIMIT;
  let copies = 0;
  units.forEach((unit, at) => {
    if (at === preview || detached.has(unit.key)) return;
    copies++;
    const made = phase === "export" || (ctx.made && copies <= limit);
    out.push(enter(unit, [...ctx.path, unit.key], made, ctx.printed));
  });
  return out;
}
