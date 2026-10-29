import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { EmbedKind } from "./embed.kind";
import { createPastedEmbed } from "./pasted-embed";

/** The embed module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerEmbedCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new EmbedKind());
  host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedEmbed(text, at, index));
}
