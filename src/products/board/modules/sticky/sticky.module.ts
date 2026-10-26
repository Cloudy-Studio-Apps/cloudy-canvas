import { StickyNote } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { STICKY_COLORS } from "../../palette";
import { StickyKind } from "./sticky.kind";
import { StickyTool } from "./sticky.tool";
import { StickyOptions } from "./ui/sticky-options";

/** Sticky notes: the kind, the tool (S) and its color panel. */
export const stickyModule = defineModule({
  id: "sticky",
  // Notes drag connectors out of their sides.
  requires: ["connector"],
  register(host) {
    host.contribute(boardCanvas.kinds, new StickyKind());
    host.contribute(boardCanvas.tools, {
      id: "sticky",
      create: (ctx) => new StickyTool(ctx),
      keys: [{ key: "s" }],
    });
    host.contribute(boardCanvas.options, {
      stickyColor: STICKY_COLORS[0].value,
      stickyColorToken: null,
    });

    host.contribute(boardEditor.tools, {
      tool: "sticky",
      element: "sticky",
      icon: StickyNote,
      toolbar: { group: 1, order: 20 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "sticky", component: StickyOptions });
    host.contribute(boardEditor.selectionPanels, { type: "sticky", component: StickyOptions });
  },
});
