import { Minus, Plus } from "lucide-react";

import { shortcutLabel } from "@engine";
import { useEngine } from "../engine/engine-context";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";
import { ZoomMenu } from "./zoom-menu";

export function ZoomControls() {
  const engine = useEngine();

  return (
    <FloatingPanel>
      <ToolButton
        label="Zoom out"
        shortcut={shortcutLabel("zoomOut")}
        onClick={() => engine.zoomOut()}
        className="size-8"
      >
        <Minus />
      </ToolButton>
      <ZoomMenu />
      <ToolButton
        label="Zoom in"
        shortcut={shortcutLabel("zoomIn")}
        onClick={() => engine.zoomIn()}
        className="size-8"
      >
        <Plus />
      </ToolButton>
    </FloatingPanel>
  );
}
