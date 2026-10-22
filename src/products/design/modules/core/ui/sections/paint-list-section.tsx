import type { ElementPatch } from "@canvas";
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

  const setPaints = (paints: (current: readonly Paint[]) => Paint[]) =>
    edit(nodes, (node) => ({ [field]: paints(node[field]) }) as ElementPatch<DesignNode>);

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
              onChange={(next) =>
                setPaints((current) => current.map((p, j) => (j === i ? next : p)))
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
