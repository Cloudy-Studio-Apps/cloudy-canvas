import { Fragment, useRef } from "react";

import type { ElementPatch } from "@canvas";
import { ImageQualityNote, type ColorChangeInfo } from "@canvas-ui";
import {
  isPlaceholderPaint,
  removedAt,
  stackBindingsPatch,
  type DesignNode,
  type Paint,
} from "@design";
import { PaintField, PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PaintListSectionProps } from "./paint-list-section.types";

/**
 * The fills or strokes of the selection, topmost first like the layers, each picture with a note
 * on how sharp the canvas shows it (`ImageQualityNote`). When the nodes' paints differ, "+"
 * replaces them all with one.
 */
export function PaintListSection({
  title,
  field,
  nodes,
  newPaint,
  children,
  allowImage,
}: PaintListSectionProps) {
  const edit = useEditNodes();
  const first = nodes[0]?.[field] ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node[field]) !== JSON.stringify(first));
  const label = title.replace(/s$/, "");
  /** Whether a drag in the picker is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);

  /** `map`: where the paints' variables go (`null`: the stack was replaced; unset: unchanged). */
  const setPaints = (
    paints: (current: readonly Paint[]) => Paint[],
    info: ColorChangeInfo = { done: true },
    map?: ((index: number) => number | null) | null,
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
      }
    >
      {mixed ? (
        <p className="text-xs text-muted-foreground">Mixed. Click + to replace them all.</p>
      ) : first.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {[...first.entries()].reverse().map(([i, paint]) => (
            <Fragment key={i}>
              <PaintField
                paint={paint}
                label={label}
                allowImage={allowImage}
                target={{ field, index: i }}
                bindPath={`${field}.${i}.color`}
                size={nodes.length === 1 && nodes[0] ? { w: nodes[0].w, h: nodes[0].h } : undefined}
                onChange={(next, info) =>
                  setPaints((current) => current.map((p, j) => (j === i ? next : p)), info)
                }
                onRemove={() =>
                  setPaints((current) => current.filter((_, j) => j !== i), undefined, removedAt(i))
                }
              />
              {paint.type === "image" && !isPlaceholderPaint(paint) && (
                <ImageQualityNote assetId={paint.assetId} className="px-1" />
              )}
            </Fragment>
          ))}
          {children}
        </div>
      ) : null}
    </PanelSection>
  );
}
