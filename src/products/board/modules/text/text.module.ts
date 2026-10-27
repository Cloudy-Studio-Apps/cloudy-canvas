import { Type } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { createPastedText } from "./pasted-text";
import { TextKind } from "./text.kind";
import { TextTool } from "./text.tool";
import * as textApi from ".";

/** Free text: the kind, the tool (T) and pasting text, which takes any text the others leave. */
export const textModule = defineModule({
  id: "text",
  tier: "core",
  // A pasted link is a card before it's text.
  after: ["embed"],
  exports: { ...textApi },
  register(host) {
    host.contribute(boardCanvas.kinds, new TextKind());
    host.contribute(boardCanvas.tools, {
      id: "text",
      create: (ctx) => new TextTool(ctx),
      keys: [{ key: "t" }],
    });
    host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedText(text, at, index));

    host.contribute(boardEditor.tools, {
      tool: "text",
      element: "text",
      icon: Type,
      toolbar: { group: 1, order: 40 },
    });
  },
});
