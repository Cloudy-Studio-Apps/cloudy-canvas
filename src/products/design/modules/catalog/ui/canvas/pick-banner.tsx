import { tCommon } from "@shared/core";
import { applyPick } from "../../mode/apply-pick";
import { CATALOG_TOOL } from "../../mode/catalog-mode.constants";
import { FloatingPanel } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

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
        <span>{t("canvas.pick.hint")}</span>
        <span className="text-muted-foreground">{t("canvas.pick.ticked", { count: ticked })}</span>
        <Button size="sm" disabled={ticked === 0 && pages.length === 0} onClick={() => done(true)}>
          {pages.length === 0 ? t("canvas.pick.add", { count: ticked }) : t("canvas.pick.update")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => done(false)}>
          {tCommon("cancel")}
        </Button>
      </FloatingPanel>
    </div>
  );
}
