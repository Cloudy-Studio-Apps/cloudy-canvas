import { Minus, Plus } from "lucide-react";

import { useEngine } from "../engine-context";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";
import { ZoomMenu } from "./zoom-menu";

export function ZoomControls() {
  const engine = useEngine();

  return (
    <FloatingPanel>
      <ToolButton
        label="Zoom out"
        shortcut={engine.keymap.label("zoomOut")}
        onClick={() => engine.zoomOut()}
        className="size-8"
      >
        <Minus />
      </ToolButton>
      <ZoomMenu />
      <ToolButton
        label="Zoom in"
        shortcut={engine.keymap.label("zoomIn")}
        onClick={() => engine.zoomIn()}
        className="size-8"
      >
        <Plus />
      </ToolButton>
    </FloatingPanel>
  );
}
