import { NodeCheckbox } from "@design/ui/components/panel";
import type { ElementPatch } from "@canvas";
import { DesignNodeKind } from "../../node/design-node.kind";
import type { DesignNode } from "../../node/design-node.types";
import { solidPaint } from "../../node/solid-paint";
import type { PropertySectionProps } from "@design/ui/modules";
import { liveRegions } from "../../network/region-picks";
import { PaintListSection } from "./paint-list-section";
import { RegionFillSection } from "./region-fill-section";
import type { RegionFillSectionProps } from "./region-fill-section.types";
import { useRegionSelection } from "../use-region-selection";
import { t } from "../../core.i18n";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/**
 * The selection's fills, and whether exports show them on kinds that can leave them out. While
 * areas of the one selected vector are picked in its edit mode, their own fills instead.
 */
export function FillSection({ selection: { nodes, kinds } }: PropertySectionProps) {
  const target = useRegionSelection();
  const only = nodes.length === 1 ? nodes[0] : undefined;
  if (target && only && target.elementId === only.id && "network" in only) {
    const node = only as RegionFillSectionProps["node"];
    // Found again after an undo or an edit renumbered them; ones taken away don't count.
    const regions = liveRegions(node.network, target.picks);
    if (regions.length > 0) return <RegionFillSection node={node} regions={regions} />;
  }
  // Image fills only when every selected node can show one (text can't).
  const allowImage = nodes.every((node) => {
    const kind = kinds.kindOf(node);
    return !(kind instanceof DesignNodeKind) || kind.imageFills;
  });
  const exportToggle =
    nodes.some((node) => node.fills.length > 0) &&
    nodes.every((node) => {
      const kind = kinds.kindOf(node);
      return kind instanceof DesignNodeKind && kind.fillExportToggle;
    });
  return (
    <PaintListSection
      title={t("sections.fills")}
      field="fills"
      nodes={nodes}
      allowImage={allowImage}
      newPaint={() => solidPaint(NEW_FILL)}
    >
      {exportToggle && (
        <NodeCheckbox
          nodes={nodes}
          label={t("sections.showInExports")}
          read={(node) => node.fillInExports !== false}
          patch={(fillInExports) => ({ fillInExports }) as ElementPatch<DesignNode>}
        />
      )}
    </PaintListSection>
  );
}
