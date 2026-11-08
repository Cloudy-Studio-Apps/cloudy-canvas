import type { ElementPatch } from "@canvas";
import { PAINT_STYLE } from "../../styles/style-paths";
import { paintBindingsOf } from "../../styles/style-bindings-of";
import { paintStyleOfNode } from "../../styles/paint-style";
import { stackBindingsPatch } from "../../node/stack-bindings";
import type { DesignNode } from "../../node/design-node.types";
import { StyleChip, StyleControl, createNodeStyle, useNodeStyleBinding } from "../styles";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import { PaintStackSection } from "./paint-stack-section";
import type { PaintListSectionProps } from "./paint-list-section.types";
import { t } from "../../core.i18n";

/**
 * The fills or strokes of the selection (`PaintStackSection`). Its header applies a color style
 * or saves the paints as one; while one is applied, the section shows it instead. When the
 * nodes' paints differ, "+" replaces them all with one.
 */
export function PaintListSection({
  title,
  field,
  nodes,
  newPaint,
  children,
  allowImage,
}: PaintListSectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const style = useNodeStyleBinding(nodes, field);

  return (
    <PaintStackSection
      title={title}
      stacks={nodes.map((node) => node[field])}
      newPaint={newPaint}
      allowImage={allowImage}
      bindPrefix={field}
      handlesField={field}
      size={nodes.length === 1 && nodes[0] ? { w: nodes[0].w, h: nodes[0].h } : undefined}
      hideAdd={style.bound !== undefined}
      replacement={style.bound !== undefined ? <StyleChip binding={style} /> : undefined}
      onChange={(paints, checkpoint, map) =>
        edit(
          nodes,
          (node) =>
            ({
              [field]: paints(node[field]),
              ...(map === undefined ? {} : stackBindingsPatch(node, field, map)),
            }) as ElementPatch<DesignNode>,
          { checkpoint },
        )
      }
      actions={
        <StyleControl
          binding={style}
          styleType={PAINT_STYLE}
          createLabel={t("paints.createStyle", { name: title.toLowerCase() })}
          create={() =>
            createNodeStyle(
              engine,
              PAINT_STYLE,
              (node) => paintStyleOfNode(node, field),
              (node) => paintBindingsOf(node, field),
            )
          }
        />
      }
    >
      {children}
    </PaintStackSection>
  );
}
