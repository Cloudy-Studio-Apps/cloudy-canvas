import { useNavigate } from "react-router";
import { ArrowLeft, Redo2, Undo2 } from "lucide-react";

import type { CanvasEngine, EngineState } from "@engine";
import { SealLogo } from "@ui/brand/seal-logo";
import { Badge } from "@ui/components/ui/badge";
import { Separator } from "@ui/components/ui/separator";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";

export function BoardTopBar({ engine, state }: { engine: CanvasEngine; state: EngineState }) {
  const navigate = useNavigate();

  return (
    <FloatingPanel className="gap-1 pr-2">
      <ToolButton label="Back to home" side="bottom" onClick={() => void navigate("/")}>
        <ArrowLeft />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-6!" />
      <SealLogo size={22} variant="mark" />
      <h1 className="ml-1 text-sm font-medium">Untitled board</h1>
      <Badge variant="board" className="ml-1">
        Board
      </Badge>
      <Separator orientation="vertical" className="mx-1.5 h-6!" />
      <ToolButton
        label="Undo"
        shortcut="Ctrl Z"
        side="bottom"
        disabled={!state.canUndo}
        onClick={() => engine.undo()}
        className="size-8"
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label="Redo"
        shortcut="Ctrl ⇧ Z"
        side="bottom"
        disabled={!state.canRedo}
        onClick={() => engine.redo()}
        className="size-8"
      >
        <Redo2 />
      </ToolButton>
    </FloatingPanel>
  );
}
