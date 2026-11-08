import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { INK_COLOR } from "../../palette";
import { createPastedText } from "./pasted-text";
import { TEXT_DEFAULTS } from "./text.defaults";
import { TextKind } from "./text.kind";
import { TextTool } from "./text.tool";

/** The text module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerTextCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new TextKind());
  host.contribute(boardCanvas.tools, {
    id: "text",
    create: (ctx) => new TextTool(ctx),
    keys: [{ key: "t" }],
  });
  host.contribute(boardCanvas.options, {
    textColor: INK_COLOR,
    textColorToken: null,
    textSize: TEXT_DEFAULTS.fontSize,
    textBold: false,
    textItalic: false,
    textAlign: "left",
    textAutoWidth: true,
  });
  host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedText(text, at, index));
}
