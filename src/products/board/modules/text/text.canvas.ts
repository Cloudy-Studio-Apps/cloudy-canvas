import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { createPastedText } from "./pasted-text";
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
  host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedText(text, at, index));
}
