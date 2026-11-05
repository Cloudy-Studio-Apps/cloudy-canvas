import {
  joinKey,
  repeatRows,
  rowNames,
  type DataScope,
  type RepeatSettings,
  type RowNames,
} from "../../../data";
import type { BrochureRepeat } from "./brochure-repeat.types";
import { DEFAULT_REPEAT_AS } from "./brochure-repeat.constants";
import type { LoopUnit } from "./repeat-tree.types";

/** A brochure repeat read as a card repeater's settings (`repeatRows`, `rowScope`). */
export function repeatSettings(repeat: BrochureRepeat): RepeatSettings {
  return repeat.as ? repeat : { ...repeat, as: DEFAULT_REPEAT_AS };
}

/** The rows on each page of a page repeat (≥ 1); sections take one row each. */
export function rowsPerPage(repeat: BrochureRepeat): number {
  const n = Math.floor(repeat.perPage ?? 1);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

/**
 * What the loop's name carries: a row's fields under `as` (`item.price`), or with several rows on
 * a page, the page's list's (`item[].price`).
 */
export function loopNames(scope: DataScope, settings: RepeatSettings, perPage: number): RowNames {
  const names = rowNames(scope, settings);
  if (perPage === 1) return names;
  const name = joinKey("", settings.as);
  const fields = new Map(
    [...names.fields].map(([key, field]) => [`${name}[]${key.slice(name.length)}`, field]),
  );
  return { fields, sources: names.sources };
}

/**
 * Every pass of a loop over `scope`, every row read (`repeatRows` in the export's phase): a row
 * each, keyed by the row's key, or `perPage` rows each, keyed by the page's position.
 */
export function loopUnits(settings: RepeatSettings, scope: DataScope, perPage: number): LoopUnit[] {
  const { rows } = repeatRows(settings, scope, "export");
  if (perPage === 1) return rows.map((row, index) => ({ key: row.key, value: row.row, index }));
  const units: LoopUnit[] = [];
  for (let at = 0; at < rows.length; at += perPage) {
    const index = units.length;
    units.push({
      key: String(index),
      value: rows.slice(at, at + perPage).map((row) => row.row),
      index,
    });
  }
  return units;
}
