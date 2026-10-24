import { Blend, Scan } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import {
  BlendModeSelect,
  BindableNumberField,
  PanelSection,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";

/** Nodes with rounded corners (frames, rectangles, and any type that stores `cornerRadius`). */
function hasCorners(node: DesignNode): node is DesignNode & { cornerRadius: number } {
  return typeof (node as { cornerRadius?: unknown }).cornerRadius === "number";
}

/**
 * Opacity and blend mode of the selection, and its corner radius when every node has corners.
 */
export function AppearanceSection({ selection: { nodes } }: PropertySectionProps) {
  const cornered = nodes.filter(hasCorners);
  const edit = useEditNodes();

  return (
    <PanelSection title="Appearance">
      <PropertyGrid>
        <BindableNumberField
          path="opacity"
          nodes={nodes}
          prefix={<Blend />}
          label="Opacity"
          suffix="%"
          min={0}
          max={100}
          read={(node) => Math.round(node.opacity * 100)}
          patch={(percent) => ({ opacity: percent / 100 })}
        />
        <BlendModeSelect
          value={sharedValue(nodes, (node) => node.blendMode)}
          onChange={(blendMode) => edit(nodes, () => ({ blendMode }))}
        />
        {cornered.length === nodes.length && (
          <BindableNumberField
            path="cornerRadius"
            nodes={cornered}
            prefix={<Scan />}
            label="Corner radius"
            min={0}
            read={(node) => node.cornerRadius}
            patch={(cornerRadius) => ({ cornerRadius }) as ElementPatch<DesignNode>}
          />
        )}
      </PropertyGrid>
    </PanelSection>
  );
}
