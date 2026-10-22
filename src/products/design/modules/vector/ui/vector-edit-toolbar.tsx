import { MousePointer2, PaintBucket, PenTool, Scissors, Spline } from "lucide-react";

import { FloatingPanel, PanelDivider, ToolButton, useEngineState } from "@canvas-ui";
import { VECTOR_TOOLS } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { useDesignEngine } from "@design/ui/design-engine-context";

const TOOLS = [
  {
    id: VECTOR_TOOLS.move,
    label: "Move points",
    description: "Pick and drag points, segments and handles.",
    icon: MousePointer2,
  },
  {
    id: VECTOR_TOOLS.pen,
    label: "Pen",
    description: "Add points, extend ends, join points.",
    icon: PenTool,
  },
  {
    id: VECTOR_TOOLS.bend,
    label: "Bend",
    description: "Drag a segment to curve it; click a point to smooth it.",
    icon: Spline,
  },
  {
    id: VECTOR_TOOLS.bucket,
    label: "Paint bucket",
    description: "Click an enclosed area to fill it, or a filled one to unfill it.",
    icon: PaintBucket,
  },
  { id: VECTOR_TOOLS.cut, label: "Cut", description: "Click a segment to cut it.", icon: Scissors },
] as const;

/** The toolbar of the vector edit mode (shown instead of the main one), with Done. */
export function VectorEditToolbar() {
  const engine = useDesignEngine();
  const tool = useEngineState((state) => state.tool);

  return (
    <FloatingPanel role="toolbar" aria-label="Vector editing">
      {TOOLS.map(({ id, label, description, icon: Icon }) => (
        <ToolButton
          key={id}
          label={label}
          description={description}
          shortcut={engine.keymap.label(`tool.${id}`)}
          active={tool === id}
          onClick={() => engine.setTool(id)}
        >
          <Icon />
        </ToolButton>
      ))}
      <PanelDivider />
      <Button size="sm" className="mx-1" onClick={() => engine.commands.editSelection?.()}>
        Done
      </Button>
    </FloatingPanel>
  );
}
