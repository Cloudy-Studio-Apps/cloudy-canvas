import { PenLine } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { HIGHLIGHTER_COLORS, HIGHLIGHTER_SIZES, MARKER_COLORS, MARKER_SIZES } from "../../palette";
import { EraserTool } from "./eraser.tool";
import { MarkerTool } from "./marker.tool";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import { StrokeKind } from "./stroke.kind";
import { DrawOptions } from "./ui/draw-options";
import { t } from "./draw.i18n";

/** Freehand strokes: the kind, the marker (M) and eraser (Shift+E) and the Draw panel. */
export const drawModule = defineModule({
  id: "draw",
  tier: "feature",
  register(host) {
    host.contribute(boardCanvas.kinds, new StrokeKind());
    host.contribute(
      boardCanvas.tools,
      { id: "marker", create: (ctx) => new MarkerTool(ctx), keys: [{ key: "m" }] },
      { id: "eraser", create: (ctx) => new EraserTool(ctx), keys: [{ key: "e", shift: true }] },
    );
    host.contribute(boardCanvas.options, {
      drawPen: STROKE_DEFAULTS.pen,
      drawSmooth: false,
      markerColor: MARKER_COLORS[0].value,
      markerColorToken: null,
      markerSize: MARKER_SIZES[1].value,
      highlighterColor: HIGHLIGHTER_COLORS[0].value,
      highlighterSize: HIGHLIGHTER_SIZES[1].value,
    });

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
