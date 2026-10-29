import { PenLine } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { DrawOptions } from "./ui/draw-options";
import { t } from "./draw.i18n";
import * as drawApi from ".";
import { registerDrawCanvas } from "./draw.canvas";

/** Freehand strokes: the kind, the marker (M) and eraser (Shift+E) and the Draw panel. */
export const drawModule = defineModule({
  id: "draw",
  tier: "feature",
  exports: { ...drawApi },
  register(host) {
    registerDrawCanvas(host);

    // One Draw button for both tools: it stays active while the eraser is picked from its panel.
    host.contribute(boardEditor.tools, {
      tool: "marker",
      element: "stroke",
      icon: PenLine,
      toolbar: { group: 1, order: 10 },
      subTools: [{ id: "eraser", label: t("options.eraser") }],
    });
    host.contribute(
      boardEditor.toolPanels,
      { tool: "marker", component: DrawOptions },
      { tool: "eraser", component: DrawOptions },
    );
    host.contribute(boardEditor.selectionPanels, { type: "stroke", component: DrawOptions });
  },
});
