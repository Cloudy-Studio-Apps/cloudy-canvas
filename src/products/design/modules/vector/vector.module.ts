import { Pencil } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { PencilTool } from "./pencil.tool";
import { VectorKind } from "./vector.kind";

/** Vectors: the kind and the pencil (Shift+P). Their strokes are edited in the Strokes section. */
export const vectorModule = defineModule({
  id: "vector",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new VectorKind());
    host.contribute(designCanvas.tools, {
      id: "pencil",
      create: (ctx) => new PencilTool(ctx),
      keys: [{ key: "p", shift: true }],
    });
    host.contribute(designEditor.tools, {
      tool: "pencil",
      label: "Pencil",
      description: "Draw freehand lines.",
      icon: Pencil,
      toolbar: { group: 1, order: 75 },
    });
  },
});
