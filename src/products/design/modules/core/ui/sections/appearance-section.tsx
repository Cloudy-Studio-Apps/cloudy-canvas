import { Blend, Scan } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "../../node/design-node.types";
import {
  BindSlot,
  BlendModeSelect,
  BindableNumberField,
  NodeCheckbox,
  PanelSection,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { t } from "../../core.i18n";

/** Nodes with rounded corners (frames, rectangles, and any type that stores `cornerRadius`). */
function hasCorners(node: DesignNode): node is DesignNode & { cornerRadius: number } {
  return typeof (node as { cornerRadius?: unknown }).cornerRadius === "number";
}

/**
 * Opacity and blend mode of the selection, its corner radius when every node has corners, and
 * whether it shows (which a boolean variable can drive).
 */
export function AppearanceSection({ selection: { nodes } }: PropertySectionProps) {
  const cornered = nodes.filter(hasCorners);
  const edit = useEditNodes();

  return (
    <PanelSection title={t("sections.appearance")}>
      <PropertyGrid>
        <BindableNumberField
          path="opacity"
          nodes={nodes}
          prefix={<Blend />}
          label={t("fields.opacity")}
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
            label={t("fields.cornerRadius")}
            min={0}
            read={(node) => node.cornerRadius}
            patch={(cornerRadius) => ({ cornerRadius }) as ElementPatch<DesignNode>}
          />
        )}
      </PropertyGrid>
      {/* Visibility, so a boolean variable can show or hide layers (the layers' eye unlinks it). */}
      <BindSlot nodes={nodes} path="visible" className="mt-1.5">
        <NodeCheckbox
          nodes={nodes}
          label={t("fields.visible")}
          read={(node) => node.visible}
          patch={(visible) => ({ visible })}
        />
      </BindSlot>
    </PanelSection>
  );
}
