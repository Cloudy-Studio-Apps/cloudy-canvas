import { Minus, Plus } from "lucide-react";

import { useEngine } from "../engine-context";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";
import { ZoomMenu } from "./zoom-menu";
import { t } from "./components.i18n";

export function ZoomControls() {
  const engine = useEngine();

  return (
    <FloatingPanel>
      <ToolButton
        label={t("zoom.out")}
        shortcut={engine.keymap.label("zoomOut")}
        onClick={() => engine.zoomOut()}
        className="size-8"
      >
        <Minus />
      </ToolButton>
      <ZoomMenu />
      <ToolButton
        label={t("zoom.in")}
        shortcut={engine.keymap.label("zoomIn")}
        onClick={() => engine.zoomIn()}
        className="size-8"
      >
        <Plus />
      </ToolButton>
    </FloatingPanel>
  );
}
