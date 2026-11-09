import { DOCUMENT_TOKENS } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { describeStyle } from "./style-args";

/** Reading the design's styles. */
export const stylesReadTools: DesignMcpTool[] = [
  {
    name: "styles_list",
    description:
      "Lists the design's styles (Figma's): text (typography), paint (a color or a paint " +
      "stack for fills or strokes), effect (an effects stack) and stroke (weight, position, " +
      "dashes, ends, corners), with their values, a summary, the variables they use and how many " +
      "layers use each. Apply one with variables_bind at the path of its kind: textStyle, " +
      "fills or strokes, effects, strokeStyle.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const { engine } = requireDesign(host);
      const store = engine.service(DOCUMENT_TOKENS).store();
      return { styles: store.styles().map((style) => describeStyle(engine, style)) };
    },
  },
];
