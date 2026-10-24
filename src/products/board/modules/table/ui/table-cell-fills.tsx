import { fillCells, isTable, partCells, TABLE_FILLS, TRANSPARENT } from "@board";
import { ColorPalette, useEngineElement } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

/** Fill colors for the selected cell, row or column of a table. */
export function TableCellFills() {
  const engine = useBoardEngine();
  const selectedId = useBoardState((state) => state.selectedId);
  const part = useBoardState((state) => state.selectedPart);
  const table = useEngineElement(selectedId);
  if (!isTable(table)) return null;
  const cells = partCells(table, part);
  const first = cells[0];
  const current = (first && table.fills[first.row]?.[first.column]) || TRANSPARENT;

  const fill = (color: string) => {
    const latest = engine.doc.get(table.id);
    if (!isTable(latest)) return;
    engine.doc.checkpoint();
    engine.doc.update(latest.id, fillCells(latest, cells, color === TRANSPARENT ? "" : color));
  };

  return (
    <ColorPalette
      colors={TABLE_FILLS}
      value={current}
      labelOf={(color) => (color.value === TRANSPARENT ? "No fill" : `${color.name} fill`)}
      onSelect={fill}
    />
  );
}
