import { BoxSelect, FileCode, LayoutGrid, ListChecks, Network, Plus, Table2 } from "lucide-react";

import { rectCenter } from "@canvas";
import { FloatingPanel, PanelDivider, ToolButton, useEditorMode, useEngine } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErDiagram, useErModel, useErQuery } from "../model";
import { diagramShapeIds } from "../er-panel/diagram-shape-ids";
import { useErToTablesStore } from "../er-to-tables";

/**
 * The ER mode's toolbar (its `modes` entry's, in place of the main one): what the mode is, a new
 * diagram, selecting and re-laying out the shown one, its text, its check (with the number of
 * errors and warnings), and Done. The element types are in
 * the palette at the left edge.
 */
export function ErModeToolbar() {
  const engine = useEngine();
  const mode = useEditorMode();
  const er = useErModel();
  const diagram = useErDiagram();
  const setOpen = useBoardPanelStore((state) => state.setErOpen);
  const setTab = useBoardPanelStore((state) => state.setErTab);
  const findings = useErQuery((d) => d.check().filter((issue) => issue.severity !== "info").length);
  const openPanel = (tab: "visual" | "text") => {
    setOpen(true);
    useBoardPanelStore.getState().setErCollapsed(false);
    setTab(tab);
  };

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
        onClick={() => openPanel("text")}
      >
        <FileCode />
      </ToolButton>
      <ToolButton
        label={findings ? `Check diagram (${findings})` : "Check diagram"}
        description="The diagram's standard and what breaks its rules, in the ER panel."
        disabled={!diagram.id}
        onClick={() => {
          engine.select([]);
          openPanel("visual");
        }}
      >
        <span className="relative">
          <ListChecks />
          {findings > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-3.5 rounded-sm bg-warning px-0.5 text-[9px] leading-3.5 font-semibold text-surface">
              {findings}
            </span>
          )}
        </span>
      </ToolButton>
      <ToolButton
        label="Create tables"
        description="Turn the shown diagram into database tables."
        disabled={!diagram.id}
        onClick={() => useErToTablesStore.getState().open(diagram.id)}
      >
        <Table2 />
      </ToolButton>
      <PanelDivider />
      <Button size="sm" className="mx-1" onClick={mode.leave}>
        Done
      </Button>
    </FloatingPanel>
  );
}
