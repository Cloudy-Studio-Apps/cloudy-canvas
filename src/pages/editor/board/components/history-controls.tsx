import { Redo2, Undo2 } from "lucide-react";

import { shortcutLabel } from "@engine";
import { useEngine, useEngineState } from "../engine/engine-context";
import { ToolButton } from "./tool-button";

export function HistoryControls() {
  const engine = useEngine();
  const canUndo = useEngineState((state) => state.canUndo);
  const canRedo = useEngineState((state) => state.canRedo);

  return (
    <>
      <ToolButton
        label="Undo"
        shortcut={shortcutLabel("undo")}
        side="bottom"
        disabled={!canUndo}
        onClick={() => engine.undo()}
        className="size-8"
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label="Redo"
        shortcut={shortcutLabel("redo")}
        side="bottom"
        disabled={!canRedo}
        onClick={() => engine.redo()}
        className="size-8"
      >
        <Redo2 />
      </ToolButton>
    </>
  );
}
