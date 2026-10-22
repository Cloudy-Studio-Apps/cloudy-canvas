import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";

import { DESIGN_TREE } from "@design";
import { useService } from "@canvas-ui";
import {
  NumberField,
  PanelIconButton,
  PanelSection,
  PropertyGrid,
} from "@design/ui/components/panel";
import { useMoveNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { alignOffset, alignTarget } from "./align";
import type { Alignment } from "./align.types";
import { sharedValue } from "@design/ui/components/panel";

const ALIGNMENTS: { id: Alignment; label: string; icon: typeof AlignStartVertical }[] = [
  { id: "left", label: "Align left", icon: AlignStartVertical },
  { id: "centerX", label: "Align horizontal centers", icon: AlignCenterVertical },
  { id: "right", label: "Align right", icon: AlignEndVertical },
  { id: "top", label: "Align top", icon: AlignStartHorizontal },
  { id: "centerY", label: "Align vertical centers", icon: AlignCenterHorizontal },
  { id: "bottom", label: "Align bottom", icon: AlignEndHorizontal },
];

/** Alignment and X/Y of the selection (a moved frame takes its children). */
export function PositionSection({ selection: { nodes } }: PropertySectionProps) {
  const tree = useService(DESIGN_TREE);
  const move = useMoveNodes();
  const target = alignTarget(nodes, (node) =>
    node.parentId ? (tree.node(node.parentId) ?? null) : null,
  );

  return (
    <PanelSection title="Position">
      <div className="mb-2 flex justify-between rounded-sm bg-muted p-0.5">
        {ALIGNMENTS.map(({ id, label, icon: Icon }) => (
          <PanelIconButton
            key={id}
            label={label}
            disabled={!target}
            onClick={() => target && move(nodes, (node) => alignOffset(node, target, id))}
          >
            <Icon />
          </PanelIconButton>
        ))}
      </div>
      <PropertyGrid>
        <NumberField
          prefix="X"
          label="X"
          value={sharedValue(nodes, (node) => node.x)}
          onCommit={(x) => move(nodes, (node) => ({ dx: Math.round(x) - node.x, dy: 0 }))}
        />
        <NumberField
          prefix="Y"
          label="Y"
          value={sharedValue(nodes, (node) => node.y)}
          onCommit={(y) => move(nodes, (node) => ({ dx: 0, dy: Math.round(y) - node.y }))}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
