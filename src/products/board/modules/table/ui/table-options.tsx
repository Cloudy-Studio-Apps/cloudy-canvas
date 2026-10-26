import { PanelTop } from "lucide-react";

import { TABLE_COLORS } from "@board";
import { FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
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
  const tableHeader = useBoardState((state) => state.options.tableHeader);
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
        <BoardColorPalette
          option="tableColor"
          colors={TABLE_COLORS}
          scopes={["shape-fill"]}
          labelOf={(color) => `${color.name} header`}
        />
      )}
      <TableLineActions />
    </FloatingPanel>
  );
}
