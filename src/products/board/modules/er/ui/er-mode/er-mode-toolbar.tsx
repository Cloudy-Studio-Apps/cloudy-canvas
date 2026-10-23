import { BoxSelect, FileCode, LayoutGrid, Network, Plus } from "lucide-react";

import { rectCenter } from "@canvas";
import { FloatingPanel, PanelDivider, ToolButton, useEngine } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErDiagram, useErModel } from "../model";
import { diagramShapeIds } from "../er-panel/diagram-shape-ids";

/**
 * The toolbar while the ER mode is on (in place of the main one): what the mode is, a new
 * diagram, selecting and re-laying out the shown one, its text, and Done. The element types are in
 * the palette at the left edge.
 */
export function ErModeToolbar() {
  const engine = useEngine();
  const er = useErModel();
  const diagram = useErDiagram();
  const setOpen = useBoardPanelStore((state) => state.setErOpen);
  const setTab = useBoardPanelStore((state) => state.setErTab);

  return (
    <FloatingPanel role="toolbar" aria-label="ER mode" aria-orientation="horizontal">
      <span className="flex items-center gap-1.5 px-2 text-sm font-medium">
        <Network className="size-4" />
        ER diagram
      </span>
      <PanelDivider />
      <ToolButton
        label="New diagram"
        description="Start another diagram in the middle of the view."
        onClick={() => engine.focusElement(er.newDiagram(rectCenter(engine.visibleWorldRect())))}
      >
        <Plus />
      </ToolButton>
      <ToolButton
        label="Select diagram"
        description="Select the whole shown diagram, to move it."
        disabled={!diagram.id}
        onClick={() => engine.select(diagramShapeIds(diagram.shapes()))}
      >
        <BoxSelect />
      </ToolButton>
      <ToolButton
        label="Re-layout"
        description="Lay the shown diagram out again."
        disabled={!diagram.id}
        onClick={() => diagram.relayout()}
      >
        <LayoutGrid />
      </ToolButton>
      <ToolButton
        label="Diagram text"
        description="Edit the shown diagram as text in the ER panel."
        onClick={() => {
          setOpen(true);
          setTab("text");
        }}
      >
        <FileCode />
      </ToolButton>
      <PanelDivider />
      <Button size="sm" className="mx-1" onClick={() => engine.setTool("select")}>
        Done
      </Button>
    </FloatingPanel>
  );
}
