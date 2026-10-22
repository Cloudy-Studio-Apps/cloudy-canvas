import { useRef } from "react";

import type { ElementPatch } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import type { DesignNode, Paint } from "@design";
import { PaintField, PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PaintListSectionProps } from "./paint-list-section.types";

/**
 * The fills or strokes of the selection, topmost first like the layers. When the nodes' paints
 * differ, "+" replaces them all with one.
 */
export function PaintListSection({
  title,
  field,
  nodes,
  newPaint,
  children,
}: PaintListSectionProps) {
  const edit = useEditNodes();
  const first = nodes[0]?.[field] ?? [];
  const mixed = nodes.some((node) => JSON.stringify(node[field]) !== JSON.stringify(first));
  const label = title.replace(/s$/, "");
  /** Whether a drag in the picker is going on: its steps join the undo step of its first one. */
  const dragging = useRef(false);

  const setPaints = (
    paints: (current: readonly Paint[]) => Paint[],
    info: ColorChangeInfo = { done: true },
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    edit(nodes, (node) => ({ [field]: paints(node[field]) }) as ElementPatch<DesignNode>, {
      checkpoint,
    });
  };

  return (
    <PanelSection
      title={title}
      actions={
        <PanelAddButton
          label={`Add ${label.toLowerCase()}`}
          onClick={() => setPaints((current) => (mixed ? [newPaint()] : [...current, newPaint()]))}
        />
      }
    >
      {mixed ? (
        <p className="text-xs text-muted-foreground">Mixed. Click + to replace them all.</p>
      ) : first.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {[...first.entries()].reverse().map(([i, paint]) => (
            <PaintField
              key={i}
              paint={paint}
              label={label}
              allowImage={field === "fills"}
              onChange={(next, info) =>
                setPaints((current) => current.map((p, j) => (j === i ? next : p)), info)
              }
              onRemove={() => setPaints((current) => current.filter((_, j) => j !== i))}
            />
          ))}
          {children}
        </div>
      ) : null}
    </PanelSection>
  );
}
