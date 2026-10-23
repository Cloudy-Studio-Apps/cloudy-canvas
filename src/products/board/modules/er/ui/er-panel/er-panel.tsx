import { useEffect } from "react";
import { BoxSelect, LayoutGrid, PencilRuler, X } from "lucide-react";

import { ER_MODE_TOOL } from "@board";
import { Button } from "@shared/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { useEngine, useEngineState, FloatingPanel } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErDiagram, useErSelection } from "../model";
import { diagramShapeIds } from "./diagram-shape-ids";
import { ErAddMenu } from "./er-add-menu";
import { ErDiagramSwitcher } from "./er-diagram-switcher";
import { ErStyleToggle } from "./er-style-toggle";
import { ErTextEditor } from "./er-text-editor";
import { ErDiagramSettings } from "./diagram-settings";
import { ErShapeForm } from "./forms";

/**
 * Right side panel for one of the board's ER diagrams: a form for the selected shape (Visual) or
 * the whole diagram as text (Text), plus the diagram switcher, Add, re-layout and the attribute
 * style, and Edit diagram (the ER mode). Opens when an ER shape is selected or the ER mode starts
 * and shows that shape's diagram; stays open until closed (or a database table is picked).
 */
export function ErPanel() {
  const engine = useEngine();
  const { any: erSelected, id: selectedId, diagram: selectedDiagram } = useErSelection();
  const diagram = useErDiagram();
  const setDiagram = useBoardPanelStore((state) => state.setErDiagram);
  const dbSelected = useEngineState(
    (state) => state.selectionTypes === "db-table" || state.selectionTypes === "db-enum",
  );
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const inMode = useEngineState((state) => state.tool === ER_MODE_TOOL);
  const open = useBoardPanelStore((state) => state.erOpen);
  const setOpen = useBoardPanelStore((state) => state.setErOpen);
  const tab = useBoardPanelStore((state) => state.erTab);
  const setTab = useBoardPanelStore((state) => state.setErTab);

  useEffect(() => {
    if (erSelected || inMode) setOpen(true);
  }, [erSelected, inMode, setOpen]);
  useEffect(() => {
    if (dbSelected) setOpen(false);
  }, [dbSelected, setOpen]);
  useEffect(() => {
    if (selectedDiagram) setDiagram(selectedDiagram);
  }, [selectedDiagram, setDiagram]);

  if (!open || dbSelected || schemaOpen) return null;

  return (
    <FloatingPanel
      role="complementary"
      aria-label="ER diagram editor"
      className="max-h-full w-[340px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-1">
        <h2 className="sr-only">ER diagram</h2>
        <ErDiagramSwitcher />
        <ErAddMenu />
        <ErStyleToggle />
        {!inMode && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Edit diagram"
            title="Edit in the ER mode: only ER diagrams can be selected, with the ER tools at hand"
            onClick={() => engine.setTool(ER_MODE_TOOL)}
          >
            <PencilRuler />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Select diagram"
          title="Select the whole diagram, to move it"
          onClick={() => engine.select(diagramShapeIds(diagram.shapes()))}
        >
          <BoxSelect />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Re-layout"
          title="Re-layout this diagram"
          onClick={() => diagram.relayout()}
        >
          <LayoutGrid />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Close panel"
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
      </header>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value === "text" ? "text" : "visual")}
        className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3"
      >
        <TabsList className="w-full">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
        </TabsList>
        <TabsContent value="visual">
          {selectedId ? <ErShapeForm id={selectedId} /> : <ErDiagramSettings />}
        </TabsContent>
        <TabsContent value="text" className="flex min-h-0 flex-col">
          {!selectedId && (
            <p className="mb-2 text-xs text-muted-foreground">
              Select a shape on the board to edit it with a form, or use Add. The Visual tab shows
              the diagram's settings.
            </p>
          )}
          <ErTextEditor />
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
}
