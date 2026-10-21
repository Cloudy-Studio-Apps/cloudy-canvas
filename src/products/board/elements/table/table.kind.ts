import {
  BoxKind,
  type ElementDescription,
  type ElementHandle,
  type ElementInteraction,
  type ElementPatch,
  type ElementSpec,
  type ElementText,
  type ElementTextStyle,
  type ElementView,
  type InteractionQuery,
  type PartClick,
  type Point,
  type Rect,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR, TABLE_COLORS } from "../../palette";
import { createTable } from "./table.factory";
import { drawTable } from "./table.draw";
import { TABLE_DEFAULTS } from "./table.defaults";
import {
  clearCells,
  gridFromCells,
  gridPatch,
  removeLine,
  scaleTable,
  setCell,
} from "./table-edits";
import { tableAddBars, tableGrips } from "./table.handles";
import { tableInteractionAt } from "./table.interactions";
import { cellAt, cellBox, cellFontWeight, lineBounds } from "./table.layout";
import type { TableCell } from "./table.layout.types";
import { cellPart, cellsPart, clickedCells, parseTablePart, partCells } from "./table-parts";
import type { TableElement } from "./table.types";

/**
 * A grid of cells, each edited in place (double-click a cell; Tab moves to the next one). When
 * selected it shows "+" strips that add a row or column, grips that select and reorder rows and
 * columns, and grid lines that resize them.
 */
export class TableKind extends BoxKind<TableElement, BoardToolOptions> {
  readonly type = "table";
  readonly label = "Table";
  readonly description = "A grid of cells for lists, comparisons and plans.";
  override readonly tool = "table";
  override readonly defaults = TABLE_DEFAULTS;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "cells",
    "header",
    "color",
  ]);
  override readonly specProperties = {
    cells: {
      type: "array",
      items: { type: "array", items: { type: "string" } },
      description: "Table only: the cell texts, one array per row (defaults to an empty 3×4 grid).",
    },
    header: {
      type: "boolean",
      description: "Table only: whether the first row is a bold, tinted header.",
    },
  };

  override readonly text: ElementText<TableElement> = {
    get: (el, part) => {
      const cell = this.cellOf(el, part);
      return el.cells[cell.row]?.[cell.column] ?? "";
    },
    set: (el, text, part) => {
      const { row, column } = this.cellOf(el, part);
      return text === (el.cells[row]?.[column] ?? "") ? null : setCell(el, row, column, text);
    },
    style: (el, part) => this.cellStyle(el, this.cellOf(el, part).row),
    partAt: (el, p) => {
      const cell = cellAt(el, p);
      return cell && cellPart(cell.row, cell.column);
    },
    partBox: (el, part) => cellBox(el, this.cellOf(el, part)),
    nextPart: (el, part, back) => {
      const { row, column } = this.cellOf(el, part);
      const count = el.columns.length;
      const next = row * count + column + (back ? -1 : 1);
      if (next < 0 || next >= el.rows.length * count) return null;
      return cellPart(Math.floor(next / count), next % count);
    },
    firstPart: (el, requested) => {
      const { row, column } = this.cellOf(el, requested);
      return cellPart(row, column);
    },
  };

  draw(view: ElementView, el: TableElement): void {
    drawTable(view, el);
  }

  override resize(el: TableElement, rect: Rect): ElementPatch<TableElement> {
    return scaleTable(el, rect);
  }

  /** A click on a selected table selects the cell under it (to color it, or Enter to edit it). */
  /** Shift extends the selected cells to a block, Ctrl/Cmd adds or removes one. */
  override partAt(el: TableElement, p: Point, click: PartClick): string | null {
    const cell = cellAt(el, p);
    if (!cell) return null;
    const cells = clickedCells(el, cell, click);
    return cells.length > 0 ? cellsPart(cells) : null;
  }

  override partBounds(el: TableElement, part: string): Rect[] {
    const parsed = parseTablePart(part);
    if (!parsed) return [];
    if (parsed.kind !== "cells") {
      const bounds = lineBounds(el, parsed.kind, parsed.index);
      return bounds ? [bounds] : [];
    }
    return parsed.cells
      .map((cell) => cellBox(el, cell))
      .filter((box) => box.w > 0 && box.h > 0)
      .map((box) => ({ ...box, x: el.x + box.x, y: el.y + box.y }));
  }

  /** Deleting a row or column removes it; deleting cells clears their text. */
  override removePart(el: TableElement, part: string): ElementPatch<TableElement> | null {
    const parsed = parseTablePart(part);
    if (!parsed) return null;
    if (parsed.kind !== "cells") return removeLine(el, parsed.kind, parsed.index);
    const filled = partCells(el, part).some((c) => el.cells[c.row]?.[c.column]);
    return filled ? clearCells(el, parsed.cells) : null;
  }

  override handles(el: TableElement, zoom: number): ElementHandle[] {
    return [
      ...tableAddBars(el, zoom).map(({ rect }) => ({ ...rect, look: "add" as const })),
      ...tableGrips(el, zoom).map(({ rect }) => ({ ...rect, look: "bar" as const })),
    ];
  }

  override interactionAt(
    el: TableElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    return tableInteractionAt(el, p, query);
  }

  override build(spec: ElementSpec, index: string): TableElement {
    const color = spec.color ?? TABLE_COLORS[0].value;
    const header = typeof spec.args.header === "boolean" ? spec.args.header : false;
    const table = createTable(spec, color, header, index);
    const cells = readCells(spec.args.cells);
    return { ...table, ...(cells ? gridFromCells(table, cells) : gridPatch(table, {})) };
  }

  override completePatch(
    el: TableElement,
    patch: ElementPatch<TableElement>,
  ): ElementPatch<TableElement> {
    const cells = patch.cells && readCells(patch.cells);
    if (cells) return { ...patch, ...gridFromCells({ ...el, ...patch }, cells) };
    if (patch.header !== undefined) return { ...patch, ...gridPatch({ ...el, ...patch }, {}) };
    return patch;
  }

  override fillDefaults(el: TableElement): TableElement {
    return {
      ...el,
      header: el.header ?? false,
      color: el.color ?? TABLE_COLORS[0].value,
      fills: el.fills ?? el.cells.map((cells) => cells.map(() => "")),
    };
  }

  override describe(el: TableElement): ElementDescription {
    return {
      label: (el.cells[0] ?? []).filter(Boolean).join(" | ") || undefined,
      kind: `${el.rows.length}×${el.columns.length}`,
    };
  }

  override optionsOf(el: TableElement): Partial<BoardToolOptions> {
    return { tableColor: el.color, tableHeader: el.header };
  }

  override restyle(
    el: TableElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<TableElement> {
    const patch: ElementPatch<TableElement> = {};
    if (options.tableColor && options.tableColor !== el.color) patch.color = options.tableColor;
    if (options.tableHeader !== undefined && options.tableHeader !== el.header) {
      // Header text is bold, so its row may need to grow.
      Object.assign(patch, gridPatch(el, { header: options.tableHeader }));
    }
    return patch;
  }

  /** The cell a part names: a row's first cell, a column's top cell, or the first cell. */
  private cellOf(el: TableElement, part: string | undefined): TableCell {
    const parsed = parseTablePart(part);
    const cell =
      parsed?.kind === "cells" && parsed.cells[0]
        ? parsed.cells[0]
        : {
            row: parsed?.kind === "row" ? parsed.index : 0,
            column: parsed?.kind === "column" ? parsed.index : 0,
          };
    return {
      row: Math.min(cell.row, el.rows.length - 1),
      column: Math.min(cell.column, el.columns.length - 1),
    };
  }

  private cellStyle(el: TableElement, row: number): ElementTextStyle {
    const { fontSize, padX, padY } = TABLE_DEFAULTS;
    return {
      fontSize,
      color: INK_COLOR,
      fontWeight: cellFontWeight(el, row) === 600 ? "600" : "400",
      align: "left",
      vAlign: "middle",
      padX,
      padY,
    };
  }
}

/** An agent's `cells`: rows of strings (numbers are written as text), or `undefined` if invalid. */
function readCells(value: unknown): string[][] | undefined {
  if (!Array.isArray(value)) return undefined;
  if (value.length === 0 || !value.every((row) => Array.isArray(row))) return undefined;
  return value.map((row: unknown[]) =>
    row.map((cell) => (typeof cell === "string" || typeof cell === "number" ? String(cell) : "")),
  );
}
