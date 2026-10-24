import { Redo2, Undo2 } from "lucide-react";

import { useEngine, useEngineState } from "../engine-context";
import { ToolButton } from "./tool-button";

export function HistoryControls() {
  const engine = useEngine();
  const canUndo = useEngineState((state) => state.canUndo);
  const canRedo = useEngineState((state) => state.canRedo);
  // While following an agent, Undo and Redo are its own (`CanvasEngine.setHistoryTarget`).
  const owner = useEngineState((state) => state.historyOwner);
  const undoLabel = useEngineState((state) => state.undoLabel);
  const redoLabel = useEngineState((state) => state.redoLabel);

  return (
    <>
      <ToolButton
        label={owner ? `Undo ${owner}'s change` : "Undo"}
        description={undoLabel ?? undefined}
        shortcut={engine.keymap.label("undo")}
        side="bottom"
        disabled={!canUndo}
        onClick={() => engine.undo()}
        className="size-8"
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label={owner ? `Redo ${owner}'s change` : "Redo"}
        description={redoLabel ?? undefined}
        shortcut={engine.keymap.label("redo")}
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
