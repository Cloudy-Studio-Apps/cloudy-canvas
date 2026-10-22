import { Maximize } from "lucide-react";

import { useEngineState } from "@canvas-ui";
import { PanelIconButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** With nothing selected: the page, its zoom, and zoom to fit. */
export function PageSection() {
  const engine = useDesignEngine();
  const zoom = useEngineState((state) => state.zoom);
  return (
    <PanelSection
      title="Page"
      actions={
        <PanelIconButton
          label={`Zoom to fit (${engine.keymap.label("zoomToFit")})`}
          onClick={() => engine.zoomToFit()}
        >
          <Maximize />
        </PanelIconButton>
      }
    >
      <p className="text-xs text-muted-foreground">Page 1 · {Math.round(zoom * 100)}%</p>
    </PanelSection>
  );
}
