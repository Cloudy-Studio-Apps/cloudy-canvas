import { StickyNote } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { StickyOptions } from "./ui/sticky-options";
import * as stickyApi from ".";
import { registerStickyCanvas } from "./sticky.canvas";

/** Sticky notes: the kind, the tool (S) and its color panel. */
export const stickyModule = defineModule({
  id: "sticky",
  tier: "feature",
  // Notes drag connectors out of their sides.
  requires: ["connector"],
  exports: { ...stickyApi },
  register(host) {
    registerStickyCanvas(host);

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
