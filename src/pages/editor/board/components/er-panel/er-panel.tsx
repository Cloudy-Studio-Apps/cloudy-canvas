import { useEffect } from "react";
import { LayoutGrid, X } from "lucide-react";

import { useBoardPanelStore } from "@stores/board-panel-store";
import { Button } from "@ui/components/ui/button";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { useErVersion } from "../../engine/use-er-version";
import { FloatingPanel } from "../floating-panel";
import { SourceEditor } from "../source-editor";
import { ErSyntaxHint } from "./er-syntax-hint";

/**
 * Right side panel for the board's ER diagram: its text, applied while typing, and a re-layout
 * button. Opens when an ER shape is selected and stays open until closed (or a table is picked).
 */
export function ErPanel() {
  const engine = useEngine();
  const version = useErVersion();
  const erSelected = useEngineState((state) => state.erSelected);
  const dbSelected = useEngineState((state) => !!(state.selectedTableId || state.selectedEnumId));
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const open = useBoardPanelStore((state) => state.erOpen);
  const setOpen = useBoardPanelStore((state) => state.setErOpen);

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
      <header className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">ER diagram</h2>
        <Button variant="ghost" size="sm" onClick={() => engine.er.relayout()}>
          <LayoutGrid />
          Re-layout
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
      <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3">
        <SourceEditor
          version={version}
          label="ER diagram text"
          hint="Entities, relations and attributes are matched by name, so renames keep their place. New ones are placed automatically."
          read={() => engine.er.text()}
          apply={(text) => engine.er.applyText(text)}
        />
        <ErSyntaxHint />
      </div>
    </FloatingPanel>
  );
}
