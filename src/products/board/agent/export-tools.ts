import {
  bytesToBase64,
  exportPath,
  optionalChoice,
  optionalNumber,
  optionalString,
  stringList,
  type ExportFormat,
  type ToolArgs,
} from "@canvas";
import { ToolImage } from "@shared/core";

import type { BoardWorkspace } from "../board-engine.types";
import { requireBoard, requireShapes } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";

const FORMATS: readonly ExportFormat[] = ["png", "jpg", "pdf", "csv"];
const BACKGROUNDS = ["solid", "transparent"] as const;
/** Keeps pictures sent to agents small enough to read. */
const VIEW_MAX_SIDE = 2000;
const IDS_SCHEMA = {
  type: "array",
  items: { type: "string" },
  description: "Shapes to include, with what moves with them. Omit for the whole board.",
};

export const exportTools: BoardAgentTool[] = [
  {
    name: "export_shapes",
    description:
      "Exports the board, or some shapes, to a file as the Export dialog does: png or jpg (an " +
      "image), pdf (one page) or csv (the tables' and database tables' cells). The file goes to " +
      '"path" (absolute; the extension is added when missing), or next to the board\'s file, ' +
      "named after the board. An existing file is replaced. Returns the path written.",
    inputSchema: {
      type: "object",
      required: ["format"],
      properties: {
        format: { enum: FORMATS },
        ids: IDS_SCHEMA,
        path: { type: "string", description: "Absolute path of the file to write." },
        background: {
          enum: BACKGROUNDS,
          description: "PNG only: transparent or the canvas color (solid, the default).",
        },
        scale: { type: "number", description: "Pixels per world unit for images (2 by default)." },
      },
    },
    run: async (host, args) => {
      const board = requireBoard(host);
      const format = optionalChoice(args, "format", FORMATS);
      if (!format) throw new Error(`"format" must be one of: ${FORMATS.join(", ")}.`);
      const ids = optionalIds(board.engine, args);
      const path = exportPath(board, format, optionalString(args, "path"), "board");
      const file = await board.engine.exportElements({
        format,
        background: optionalChoice(args, "background", BACKGROUNDS) ?? "solid",
        area: "board",
        ids,
        scale: optionalNumber(args, "scale"),
      });
      await host.writeFile(path, file);
      return { path, bytes: file.size };
    },
  },
  {
    name: "view_board",
    description:
      "Returns a PNG picture of the board, or of some shapes, as the user sees them, to check " +
      `how your changes look. At most ${VIEW_MAX_SIDE} pixels on its longest side.`,
    inputSchema: {
      type: "object",
      properties: {
        ids: IDS_SCHEMA,
        scale: { type: "number", description: "Pixels per world unit (1 by default)." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const png = await engine.exportElements({
        format: "png",
        background: "solid",
        area: "board",
        ids: optionalIds(engine, args),
        scale: optionalNumber(args, "scale") ?? 1,
        maxSide: VIEW_MAX_SIDE,
      });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
  {
    name: "copy_as_png",
    description:
      "Copies shapes (with what moves with them) to the system clipboard as a PNG image with a " +
      "transparent background, as Ctrl+Shift+C does. Without ids, copies the user's selection.",
    inputSchema: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const ids = optionalIds(engine, args);
      if (!ids && engine.selectedIds().length === 0) {
        throw new Error('Nothing is selected: pass "ids".');
      }
      await engine.copyAsPng(ids);
      return "Copied to the clipboard.";
    },
  },
];

/** The ids given (each checked), or `undefined` for the whole board. */
function optionalIds(engine: BoardWorkspace, args: ToolArgs): string[] | undefined {
  if (args.ids === undefined || args.ids === null) return undefined;
  const ids = requireShapes(engine, stringList(args, "ids"));
  if (ids.length === 0) throw new Error('"ids" is empty: omit it for the whole board.');
  return ids;
}
