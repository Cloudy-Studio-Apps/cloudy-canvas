import { bindCells, cellFillPath } from "../table-cell-bindings";
import { fillCells } from "../table-edits";
import { isTable } from "../is-table";
import { partCells } from "../table-parts";
import { TABLE_FILLS, TRANSPARENT } from "../../../palette";
import { ColorPalette, useEngineElement } from "@canvas-ui";
import { DocumentColorsButton } from "@board/ui/components/board-colors";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../table.i18n";

/** Fill colors for the selected cell, row or column of a table; a board color binds them. */
export function TableCellFills() {
  const engine = useBoardEngine();
  const selectedId = useBoardState((state) => state.selectedId);
  const part = useBoardState((state) => state.selectedPart);
  const table = useEngineElement(selectedId);
  if (!isTable(table)) return null;
  const cells = partCells(table, part);
  const first = cells[0];
  const current = (first && table.fills[first.row]?.[first.column]) || TRANSPARENT;
  const token = first ? (table.bindings?.[cellFillPath(first.row, first.column)] ?? null) : null;

  const fill = (color: string) => {
    const latest = engine.doc.get(table.id);
    if (!isTable(latest)) return;
    engine.doc.checkpoint();
    engine.doc.update(latest.id, {
      ...fillCells(latest, cells, color === TRANSPARENT ? "" : color),
      ...bindCells(latest, cells, null),
    });
  };
  // The token sync writes the bound cells' colors in the same undo step.
  const bind = (variableId: string) => {
    const latest = engine.doc.get(table.id);
    if (!isTable(latest)) return;
    engine.doc.checkpoint();
    engine.doc.update(latest.id, bindCells(latest, cells, variableId));
  };

  return (
    <>
      <DocumentColorsButton token={token} scopes={["shape-fill"]} onPick={bind} />
      <ColorPalette
        colors={TABLE_FILLS}
        value={current}
        labelOf={(color) =>
          color.value === TRANSPARENT ? t("fills.none") : t("fills.color", { color: color.name })
        }
        onSelect={fill}
        noneSelected={!!token}
      />
    </>
  );
}
