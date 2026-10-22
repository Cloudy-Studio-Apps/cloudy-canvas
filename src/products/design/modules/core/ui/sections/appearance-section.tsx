import { Blend, Scan } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { sharedValue } from "./shared-value";

/** Nodes with rounded corners (frames, rectangles, and any type that stores `cornerRadius`). */
function hasCorners(node: DesignNode): node is DesignNode & { cornerRadius: number } {
  return typeof (node as { cornerRadius?: unknown }).cornerRadius === "number";
}

/** Opacity of the selection, and its corner radius when every node has corners. */
export function AppearanceSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const corners = nodes.every(hasCorners);

  return (
    <PanelSection title="Appearance">
      <PropertyGrid>
        <NumberField
          prefix={<Blend />}
          label="Opacity"
          suffix="%"
          min={0}
          max={100}
          value={sharedValue(nodes, (node) => Math.round(node.opacity * 100))}
          onCommit={(percent) => edit(nodes, () => ({ opacity: percent / 100 }))}
        />
        {corners && (
          <NumberField
            prefix={<Scan />}
            label="Corner radius"
            min={0}
            value={sharedValue(nodes, (node) => (hasCorners(node) ? node.cornerRadius : 0))}
            onCommit={(radius) =>
              edit(nodes, () => ({ cornerRadius: radius }) as ElementPatch<DesignNode>)
            }
          />
        )}
      </PropertyGrid>
    </PanelSection>
  );
}
