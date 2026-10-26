import { applyPick } from "../../mode/apply-pick";
import { CATALOG_TOOL } from "../../mode/catalog-mode.constants";
import { FloatingPanel } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";

/** While frames are being picked: how many are ticked, applying them, or cancelling. */
export function PickBanner() {
  const engine = useDesignEngine();
  const ticked = useDesignState((state) => state.selectionCount);
  const { pages } = useBrochure();
  const done = (apply: boolean) => {
    if (apply) applyPick(engine);
    engine.select([]);
    engine.setTool(CATALOG_TOOL);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
      <FloatingPanel className="gap-3 py-1.5 pr-1.5 pl-3 text-sm">
        <span>Pick the frames for the brochure: click them, or drag a box round a row.</span>
        <span className="text-muted-foreground">{ticked} ticked</span>
        <Button size="sm" disabled={ticked === 0 && pages.length === 0} onClick={() => done(true)}>
          {pages.length === 0 ? `Add ${ticked} ${ticked === 1 ? "page" : "pages"}` : "Update pages"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => done(false)}>
          Cancel
        </Button>
      </FloatingPanel>
    </div>
  );
}
