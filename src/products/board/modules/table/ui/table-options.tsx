import { PanelTop } from "lucide-react";

import { TABLE_COLORS } from "@board";
import { ColorPalette, FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { TableCellFills } from "./table-cell-fills";
import { TableLineActions } from "./table-line-actions";

/**
 * Header row and header tint for new tables; also restyles the selected tables. With a cell, row
 * or column selected, the swatches fill those cells instead, and a row or column can be inserted
 * or deleted.
 */
export function TableOptions() {
  const engine = useBoardEngine();
  const { tableColor, tableHeader } = useBoardState((state) => state.options);
  const hasPart = useBoardState((state) => state.selectedPart !== null);

  return (
    <FloatingPanel role="group" aria-label="Table options" className="gap-1 px-2">
      <OptionButton
        aria-label="Header row"
        title="Header row"
        selected={tableHeader}
        onClick={() => engine.setToolOptions({ tableHeader: !tableHeader })}
      >
        <PanelTop className="size-[18px]" />
      </OptionButton>
      <PanelDivider />
      {hasPart ? (
        <TableCellFills />
      ) : (
        <ColorPalette
          colors={TABLE_COLORS}
          value={tableColor}
          labelOf={(color) => `${color.name} header`}
          onSelect={(color) => engine.setToolOptions({ tableColor: color })}
        />
      )}
      <TableLineActions />
    </FloatingPanel>
  );
}
