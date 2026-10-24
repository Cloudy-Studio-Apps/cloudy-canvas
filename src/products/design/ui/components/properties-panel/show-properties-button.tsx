import { PanelRightOpen } from "lucide-react";

import { ToolButton, useEngineState } from "@canvas-ui";
import { RULER_SIZE } from "@canvas";
import { useDesignPanelStore } from "../../stores/design-panel-store";

/** Over the canvas's top right corner while the properties panel is closed: opens it again. */
export function ShowPropertiesButton() {
  const setOpen = useDesignPanelStore((state) => state.setRightOpen);
  // Below the top ruler when it shows, so the button never covers its numbers.
  const rulers = useEngineState((state) => state.rulersShown);

  return (
    <div
      className="pointer-events-auto absolute right-3 rounded-lg border bg-surface p-1 shadow-lifted"
      style={{ top: rulers ? RULER_SIZE + 8 : 12 }}
    >
      <ToolButton label="Show properties panel" side="left" onClick={() => setOpen(true)}>
        <PanelRightOpen />
      </ToolButton>
    </div>
  );
}
