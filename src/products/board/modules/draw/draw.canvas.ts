import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { HIGHLIGHTER_COLORS, HIGHLIGHTER_SIZES, MARKER_COLORS, MARKER_SIZES } from "../../palette";
import { EraserTool } from "./eraser.tool";
import { MarkerTool } from "./marker.tool";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import { StrokeKind } from "./stroke.kind";

/** The draw module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerDrawCanvas(host: ModuleHost): void {
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
}
