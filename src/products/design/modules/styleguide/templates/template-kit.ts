import type { StyleRecord, VariableRecord } from "@canvas";

import { SHEET_LOOK, stack } from "../sheet";
import type {
  GeneratedSpec,
  SheetBuildContext,
  SheetGroup,
  SheetItem,
  TemplateOptions,
  TemplateOptionSpec,
} from "../styleguide.types";

/** A variable's or style's own name, after its groups. */
export function leafName(record: VariableRecord | StyleRecord): string {
  return record.name.slice(record.name.lastIndexOf("/") + 1);
}

/** The variables of a group (templates of variable categories draw only these). */
export function variablesOf(group: SheetGroup): VariableRecord[] {
  return group.items.flatMap((item: SheetItem) => (item.kind === "variable" ? [item.record] : []));
}

/** The styles of a group. */
export function stylesOf(group: SheetGroup): StyleRecord[] {
  return group.items.flatMap((item: SheetItem) => (item.kind === "style" ? [item.record] : []));
}

/** A color variable's value in the context's modes (`#RRGGBBAA`), black when it can't be read. */
export function colorOf(context: SheetBuildContext, id: string): string {
  const value = context.resolve(id);
  return value?.type === "color" ? value.color : "#000000FF";
}

/** A number variable's value in the context's modes, 0 when it can't be read. */
export function numberOf(context: SheetBuildContext, id: string): number {
  const value = context.resolve(id);
  return value?.type === "number" ? value.number : 0;
}

/** A number as people read it: at most two decimals. */
export function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** The font an option picked (the sheet's font by default). */
export function fontOf(options: TemplateOptions): string {
  return typeof options.font === "string" ? options.font : SHEET_LOOK.font;
}

/** Items laid out `columns` to a row: a column of rows. */
export function grid(
  key: string,
  cells: readonly GeneratedSpec[],
  columns: number,
  gap: number = SHEET_LOOK.gap,
): GeneratedSpec {
  const per = Math.max(1, Math.round(columns));
  const rows: GeneratedSpec[] = [];
  for (let i = 0; i < cells.length; i += per) {
    rows.push(stack(`row:${i / per}`, "horizontal", cells.slice(i, i + per), { gap }));
  }
  return stack(key, "vertical", rows, { gap });
}

/** Options with other defaults (`{ swatch: 72 }`); a default must suit its option's type. */
export function withDefaults(
  specs: readonly TemplateOptionSpec[],
  defaults: Readonly<Record<string, boolean | number | string>>,
): TemplateOptionSpec[] {
  return specs.map((spec) =>
    spec.id in defaults ? ({ ...spec, default: defaults[spec.id] } as TemplateOptionSpec) : spec,
  );
}
