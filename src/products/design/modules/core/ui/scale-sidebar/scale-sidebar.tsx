import { useState } from "react";

import { elementBounds, unionRects, type ScaleAnchor } from "@canvas";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useSelectedNodes } from "@design/ui/hooks";
import { AnchorPicker } from "@canvas-ui";
import { t } from "../../core.i18n";

/** Smallest width or height typed in the panel. */
const MIN_SIDE = 1;

/**
 * The properties panel while the Scale tool (K) is on, as in Figma: the selection's width and
 * height and a scale factor, which scale it and everything in it (fonts, strokes, radii,
 * children) round the anchor picked in the grid, one undo step each.
 */
export function ScaleSidebar() {
  const engine = useDesignEngine();
  const nodes = useSelectedNodes();
  const [anchor, setAnchor] = useState<ScaleAnchor>("top-left");
  const box = unionRects(nodes.map((node) => elementBounds(engine.kinds.kindOf(node), node)));

  const scale = (factor: number) =>
    engine.scaleElements(
      nodes.map((node) => node.id),
      factor,
      anchor,
    );

  return (
    <PanelSection title={t("scale.title")} className="border-b-0">
      {box ? (
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <PropertyGrid>
              <NumberField
                prefix="W"
                label={t("fields.width")}
                min={MIN_SIDE}
                value={box.w}
                onCommit={(w) => box.w > 0 && scale(w / box.w)}
              />
              <NumberField
                prefix="H"
                label={t("fields.height")}
                min={MIN_SIDE}
                value={box.h}
                onCommit={(h) => box.h > 0 && scale(h / box.h)}
              />
            </PropertyGrid>
            {/* Back to 100% once it has scaled (a new box). */}
            <NumberField
              key={`${box.w}×${box.h}`}
              prefix="×"
              label={t("scale.title")}
              suffix="%"
              min={1}
              value={100}
              onCommit={(percent) => scale(percent / 100)}
            />
          </div>
          <AnchorPicker value={anchor} onChange={setAnchor} label={t("scale.from")} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("scale.hint")}</p>
      )}
    </PanelSection>
  );
}
