import type { ElementPatch } from "@canvas";
import type { DesignNode, DesignNodeKind, LayoutAxis } from "@design";
import {
  BindSlot,
  NodeCheckbox,
  NodeSelectField,
  PanelSection,
  PropertyGrid,
} from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { inAutoLayout } from "./in-auto-layout";

const LABELS = { fixed: "Fixed", hug: "Hug", fill: "Fill" } as const;

/**
 * How the selection's width and height are decided (Figma's resizing menus): fixed, hugging what
 * it holds (auto layout frames, texts) or filling its auto layout parent; and, inside one,
 * "Ignore auto layout".
 */
export function SizingSection({ selection: { nodes, kinds, elements } }: PropertySectionProps) {
  const kindOf = (node: DesignNode) => kinds.kindOf(node) as unknown as DesignNodeKind;
  const inside = nodes.every((node) => inAutoLayout(node, elements));
  const select = (axis: LayoutAxis, label: string) => {
    const hug = nodes.every((node) => kindOf(node).canHug(node, axis));
    const options = (["fixed", ...(hug ? ["hug"] : []), ...(inside ? ["fill"] : [])] as const).map(
      (value) => ({ value, label: LABELS[value as keyof typeof LABELS] }),
    );
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-3 shrink-0 text-center text-xs text-subtle-foreground">
          {axis === "h" ? "W" : "H"}
        </span>
        <NodeSelectField
          nodes={nodes}
          label={label}
          options={options}
          read={(node) => kindOf(node).sizingOf(node, axis)}
          patch={(value, node) =>
            kindOf(node).sizingPatch(node, axis, value as keyof typeof LABELS)
          }
        />
      </div>
    );
  };

  return (
    <PanelSection title="Resizing">
      <div className="flex flex-col gap-2">
        <PropertyGrid>
          {select("h", "Width sizing")}
          {select("v", "Height sizing")}
        </PropertyGrid>
        {inside && (
          <BindSlot nodes={nodes} path="layoutAbsolute">
            <NodeCheckbox
              nodes={nodes}
              label="Ignore auto layout"
              read={(node) => node.layoutAbsolute}
              patch={(layoutAbsolute) => ({ layoutAbsolute }) as ElementPatch<DesignNode>}
            />
          </BindSlot>
        )}
      </div>
    </PanelSection>
  );
}
