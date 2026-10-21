import { useEffect } from "react";
import { LayoutGrid, X } from "lucide-react";

import { useBoardPanelStore } from "@stores/board-panel-store";
import { Button } from "@ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel } from "../floating-panel";
import { ErAddMenu } from "./er-add-menu";
import { ErStyleToggle } from "./er-style-toggle";
import { ErTextEditor } from "./er-text-editor";
import { ErShapeForm } from "./forms";

/**
 * Right side panel for the board's ER diagram: a form for the selected shape (Visual) or the whole
 * diagram as text (Text), plus Add, re-layout and the attribute style. Opens when an ER shape is
 * selected and stays open until closed (or a database table is picked).
 */
export function ErPanel() {
  const engine = useEngine();
  const erSelected = useEngineState((state) => state.erSelected);
  const selectedId = useEngineState((state) => state.selectedErId);
  const dbSelected = useEngineState((state) => !!(state.selectedTableId || state.selectedEnumId));
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const open = useBoardPanelStore((state) => state.erOpen);
  const setOpen = useBoardPanelStore((state) => state.setErOpen);
  const tab = useBoardPanelStore((state) => state.erTab);
  const setTab = useBoardPanelStore((state) => state.setErTab);

  useEffect(() => {
    if (erSelected) setOpen(true);
  }, [erSelected, setOpen]);
  useEffect(() => {
    if (dbSelected) setOpen(false);
  }, [dbSelected, setOpen]);

  if (!open || dbSelected || schemaOpen) return null;

  return (
    <FloatingPanel
      role="complementary"
      aria-label="ER diagram editor"
      className="max-h-full w-[340px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-1">
        <h2 className="flex-1 text-sm font-semibold">ER diagram</h2>
        <ErAddMenu />
        <ErStyleToggle />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Re-layout"
          title="Re-layout the whole diagram"
          onClick={() => engine.er.relayout()}
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
        value={selectedId ? tab : "text"}
        onValueChange={(value) => setTab(value === "text" ? "text" : "visual")}
        className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3"
      >
        <TabsList className="w-full">
          <TabsTrigger value="visual" disabled={!selectedId}>
            Visual
          </TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
        </TabsList>
        <TabsContent value="visual">{selectedId && <ErShapeForm id={selectedId} />}</TabsContent>
        <TabsContent value="text" className="flex min-h-0 flex-col">
          {!selectedId && (
            <p className="mb-2 text-xs text-muted-foreground">
              Select a shape on the board to edit it with a form, or use Add.
            </p>
          )}
          <ErTextEditor />
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
}
