import { useRef } from "react";

import type { ElementPatch } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import { PAINT_STYLE } from "../../styles/style-paths";
import { paintBindingsOf } from "../../styles/style-bindings-of";
import { paintStyleOfNode } from "../../styles/paint-style";
import { stackBindingsPatch } from "../../node/stack-bindings";
import type { DesignNode } from "../../node/design-node.types";
import type { Paint } from "../../node/paint.types";
import { PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { StyleChip, StyleControl, createNodeStyle, useNodeStyleBinding } from "../styles";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import { PaintStackEditor } from "./paint-stack-editor";
import type { PaintStackMap } from "./paint-stack-editor.types";
import type { PaintListSectionProps } from "./paint-list-section.types";

/**
 * The fills or strokes of the selection (`PaintStackEditor`). Its header applies a color style
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
  const first = nodes[0]?.[field] ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node[field]) !== JSON.stringify(first));
  const label = title.replace(/s$/, "");
  /** Whether a drag in the picker is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);

  const setPaints = (
    paints: (current: readonly Paint[]) => Paint[],
    info: ColorChangeInfo = { done: true },
    map?: PaintStackMap,
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    edit(
      nodes,
      (node) =>
        ({
          [field]: paints(node[field]),
          ...(map === undefined ? {} : stackBindingsPatch(node, field, map)),
        }) as ElementPatch<DesignNode>,
      { checkpoint },
    );
  };

  return (
    <PanelSection
      title={title}
      actions={
        <>
          <StyleControl
            binding={style}
            styleType={PAINT_STYLE}
            createLabel={`Create style from these ${title.toLowerCase()}`}
            create={() =>
              createNodeStyle(
                engine,
                PAINT_STYLE,
                (node) => paintStyleOfNode(node, field),
                (node) => paintBindingsOf(node, field),
              )
            }
          />
          {style.bound === undefined && (
            <PanelAddButton
              label={`Add ${label.toLowerCase()}`}
              onClick={() =>
                setPaints(
                  (current) => (mixed ? [newPaint()] : [...current, newPaint()]),
                  undefined,
                  mixed ? null : undefined,
                )
              }
            />
          )}
        </>
      }
    >
      {style.bound !== undefined ? (
        <div className="flex flex-col gap-1.5">
          <StyleChip binding={style} />
          {children}
        </div>
      ) : (
        <PaintStackEditor
          paints={first}
          mixed={mixed}
          label={label}
          allowImage={allowImage}
          onChange={setPaints}
          bindPrefix={field}
          handlesField={field}
          size={nodes.length === 1 && nodes[0] ? { w: nodes[0].w, h: nodes[0].h } : undefined}
        >
          {children}
        </PaintStackEditor>
      )}
    </PanelSection>
  );
}
