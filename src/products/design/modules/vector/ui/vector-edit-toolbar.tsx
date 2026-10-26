import { MousePointer2, PaintBucket, PenTool, Scissors, Spline } from "lucide-react";

import { ModeToolbar, type ModeToolbarEntry } from "@canvas-ui";
import { VECTOR_TOOLS } from "../edit/vector-tools";
import { useDesignEngine } from "@design/ui/design-engine-context";

const TOOLS: readonly ModeToolbarEntry[] = [
  {
    tool: VECTOR_TOOLS.move,
    label: "Move points",
    description: "Pick and drag points, segments and handles.",
    icon: MousePointer2,
  },
  {
    tool: VECTOR_TOOLS.pen,
    label: "Pen",
    description: "Add points, extend ends, join points.",
    icon: PenTool,
  },
  {
    tool: VECTOR_TOOLS.bend,
    label: "Bend",
    description: "Drag a segment to curve it; click a point to smooth it.",
    icon: Spline,
  },
  {
    tool: VECTOR_TOOLS.bucket,
    label: "Paint bucket",
    description: "Click an enclosed area to fill it, or a filled one to unfill it.",
    icon: PaintBucket,
  },
  {
    tool: VECTOR_TOOLS.cut,
    label: "Cut",
    description: "Click a segment to cut it.",
    icon: Scissors,
  },
];

/** The toolbar of the vector edit mode (shown instead of the main one), with Done. */
export function VectorEditToolbar() {
  const engine = useDesignEngine();
  return (
    <ModeToolbar
      label="Vector editing"
      items={TOOLS}
      onDone={() => engine.commands.editSelection?.()}
    />
  );
}
