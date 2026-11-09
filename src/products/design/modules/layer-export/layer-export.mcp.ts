import {
  asUndoStep,
  exportPath,
  recordList,
  stringArg,
  stringList,
  type ElementPatch,
  type ToolArgs,
} from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { isDesignNode, type DesignNode, type NodeExport } from "../core";
import { plannedExports, renderExports } from "./export-nodes";
import { defaultSuffix, EXPORT_FILE_TYPES, EXPORT_SCALES } from "./node-exports";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Exports saved on layers, as the Export section's rows, and running them. */
export const layerExportTools: DesignMcpTool[] = [
  {
    name: "set",
    description:
      "Sets the exports saved on layers, as the rows of the Export section, replacing the ones " +
      "they have, in one undo step. An empty list clears them. They stay in the file, so " +
      "layer-export_run can make the same files again.",
    inputSchema: {
      type: "object",
      required: ["ids", "exports"],
      properties: {
        ids: IDS_SCHEMA,
        exports: {
          type: "array",
          items: {
            type: "object",
            required: ["format"],
            properties: {
              format: { enum: EXPORT_FILE_TYPES },
              scale: { enum: EXPORT_SCALES, description: "1 by default; svg and pdf ignore it." },
              suffix: {
                type: "string",
                description: "Added to the file name; @2x style by default.",
              },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const rows = recordList(args, "exports").map(readExport);
      const patches = new Map<string, ElementPatch<DesignNode>>(
        ids.map((id) => [id, { exports: rows }]),
      );
      asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return { ids, exports: rows.length };
    },
  },
  {
    name: "run",
    description:
      'Makes the files of the exports saved on layers (layer-export_set) in "folder" (absolute; ' +
      "it must exist): each layer exactly, with no padding, named after it and its suffix. " +
      "Existing files are replaced. Returns the paths written.",
    inputSchema: {
      type: "object",
      required: ["ids", "folder"],
      properties: { ids: IDS_SCHEMA, folder: { type: "string" } },
    },
    run: async (host, args) => {
      const design = requireDesign(host);
      const { engine } = design;
      const folder = stringArg(args, "folder").replace(/[\\/]+$/, "");
      const nodes = requireNodes(engine, stringList(args, "ids"))
        .map((id) => engine.getElement(id))
        .filter((el) => el !== undefined && el !== null && isDesignNode(el));
      const planned = plannedExports(engine, nodes);
      if (planned.length === 0) throw new Error("None of these layers has exports.");
      const paths = planned.map(({ row, path }) =>
        exportPath(design, row.format, `${folder}/${path}`, "design"),
      );
      const files = await renderExports(engine, planned);
      for (const [i, { file }] of files.entries()) await host.writeFile(paths[i]!, file);
      return { paths };
    },
  },
];

function readExport(args: ToolArgs, i: number): NodeExport {
  const format = EXPORT_FILE_TYPES.find((type) => type === args.format);
  if (!format) {
    throw new Error(`"exports[${i}].format" must be one of: ${EXPORT_FILE_TYPES.join(", ")}.`);
  }
  const scale = args.scale ?? 1;
  const size = EXPORT_SCALES.find((value) => value === scale);
  if (size === undefined) {
    throw new Error(`"exports[${i}].scale" must be one of: ${EXPORT_SCALES.join(", ")}.`);
  }
  if (args.suffix !== undefined && typeof args.suffix !== "string") {
    throw new Error(`"exports[${i}].suffix" must be a string.`);
  }
  return { id: createId(), scale: size, suffix: args.suffix ?? defaultSuffix(size), format };
}
