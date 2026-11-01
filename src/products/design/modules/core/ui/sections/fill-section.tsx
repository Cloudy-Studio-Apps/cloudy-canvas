import { NodeCheckbox } from "@design/ui/components/panel";
import type { ElementPatch } from "@canvas";
import { DesignNodeKind } from "../../node/design-node.kind";
import type { DesignNode } from "../../node/design-node.types";
import { solidPaint } from "../../node/solid-paint";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "./paint-list-section";
import { t } from "../../core.i18n";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/** The selection's fills, and whether exports show them on kinds that can leave them out. */
export function FillSection({ selection: { nodes, kinds } }: PropertySectionProps) {
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
