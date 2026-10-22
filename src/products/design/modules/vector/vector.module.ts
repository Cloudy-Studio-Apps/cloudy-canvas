import { Pencil, PenTool as PenIcon } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designAgentTools, designCanvas } from "../../design-points";
import { editVector } from "./edit/edit-vector";
import { PenTool } from "./edit/pen.tool";
import { VectorBendTool } from "./edit/vector-bend.tool";
import { VectorBucketTool } from "./edit/vector-bucket.tool";
import { VectorCutTool } from "./edit/vector-cut.tool";
import { VectorMoveTool } from "./edit/vector-move.tool";
import { VECTOR_TOOLS } from "./edit/vector-tools";
import { PencilTool } from "./pencil.tool";
import { vectorTools } from "./vector.agent-tools";
import { VectorEditToolbar } from "./ui/vector-edit-toolbar";
import { VectorKind } from "./vector.kind";

/**
 * Vectors: the kind (a vector network), the pen (P) and the pencil (Shift+P), and the edit mode:
 * double-click or Enter on a vector, or on a shape that converts to one, edits its points with
 * the move, pen, bend, paint bucket and cut tools and their toolbar (leaving with Done or Enter).
 */
export const vectorModule = defineModule({
  id: "vector",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new VectorKind());
    host.contribute(designCanvas.editElement, editVector);
    host.contribute(designAgentTools, { id: "vector", tools: () => vectorTools });
    host.contribute(
      designCanvas.tools,
      { id: "pencil", create: (ctx) => new PencilTool(ctx), keys: [{ key: "p", shift: true }] },
      { id: VECTOR_TOOLS.pen, create: (ctx) => new PenTool(ctx), keys: [{ key: "p" }] },
      { id: VECTOR_TOOLS.move, create: (ctx) => new VectorMoveTool(ctx) },
      { id: VECTOR_TOOLS.bend, create: (ctx) => new VectorBendTool(ctx) },
      { id: VECTOR_TOOLS.bucket, create: (ctx) => new VectorBucketTool(ctx) },
      { id: VECTOR_TOOLS.cut, create: (ctx) => new VectorCutTool(ctx) },
    );

    host.contribute(
      designEditor.tools,
      {
        tool: VECTOR_TOOLS.pen,
        label: "Pen",
        description: "Draw paths of points and curves; drag while placing a point to curve it.",
        icon: PenIcon,
        toolbar: { group: 1, order: 74, menu: "draw" },
      },
      {
        tool: "pencil",
        label: "Pencil",
        description: "Draw freehand lines.",
        icon: Pencil,
        toolbar: { group: 1, order: 75, menu: "draw" },
      },
    );
    host.contribute(designEditor.layerIcons, { type: "vector", icon: PenIcon });
    host.contribute(designEditor.toolbars, {
      id: "vector-edit",
      tools: Object.values(VECTOR_TOOLS),
      component: VectorEditToolbar,
    });
  },
});
