import { bytesToBase64, exportPath, optionalNumber, optionalString } from "@canvas";
import { ToolImage } from "@shared/core";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { exportSystem } from "../model";
import { isSheet } from "../sheet";
import { orderedCategories, settingsOf, systemPageOf } from "../system";
import { readCategory } from "./styleguide-args";
import type { StyleguideToolSources } from "./styleguide-mcp.types";

/** Keeps pictures sent to agents small enough to read. */
const VIEW_MAX_SIDE = 2000;

/** Seeing and exporting the Design system view (its hidden page). */
export function styleguideOutputTools(sources: StyleguideToolSources): DesignMcpTool[] {
  return [
    {
      name: "view_design_system",
      description:
        "Returns a PNG picture of the Design system view (the style guide on its hidden page, " +
        "which switch_page can't reach), or of one category of it, to check how templates and " +
        `options look. At most ${VIEW_MAX_SIDE} pixels on its longest side.`,
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", description: "One category's section (get_design_system)." },
          scale: { type: "number", description: "Pixels per world unit (0.5 by default)." },
        },
      },
      run: async (host, args) => {
        const { engine } = requireDesign(host);
        const page = systemPageOf(engine.doc);
        if (!page)
          throw new Error("The design has no variables or styles yet, so no Design system.");
        const category = args.category === undefined ? null : readCategory(sources, args).id;
        const order = orderedCategories(sources.categories(), settingsOf(page)).map((c) => c.id);
        const ids = engine.doc
          .all()
          .filter(isSheet)
          .filter((sheet) => sheet.pageId === page.id && sheet.parentId === null)
          .filter((sheet) => category === null || sheet.sheet.category === category)
          .sort((a, b) => order.indexOf(a.sheet.category) - order.indexOf(b.sheet.category))
          .map((sheet) => sheet.id);
        if (ids.length === 0) {
          throw new Error(
            category
              ? `The ${category} category has nothing to show.`
              : "The Design system is empty.",
          );
        }
        // Drawn on the hidden page through your workspace, which goes back to your page after.
        const scope = engine.scope;
        try {
          if (engine.scope !== page.id) engine.setScope(page.id);
          const png = await engine.exportElements({
            format: "png",
            background: "solid",
            area: "board",
            ids,
            scale: optionalNumber(args, "scale") ?? 0.5,
            maxSide: VIEW_MAX_SIDE,
          });
          return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
        } finally {
          if (scope !== null && engine.scope !== scope) engine.setScope(scope);
        }
      },
    },
    {
      name: "export_design_system",
      description:
        "Exports the whole Design system (every category the view shows, in its order) as one " +
        'PDF, a page per category sized to its content. The file goes to "path" (absolute; ' +
        ".pdf is added when missing), or next to the design's file, named after it. An existing " +
        "file is replaced. Returns the path written. (export_nodes exports layers of a page.)",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Absolute path of the file to write." },
        },
      },
      run: async (host, args) => {
        const design = requireDesign(host);
        const path = exportPath(
          { ...design, name: `${design.name} - Design system` },
          "pdf",
          optionalString(args, "path"),
          "design",
        );
        const file = await exportSystem(design.engine, sources.categories());
        await host.writeFile(path, file);
        return { path, bytes: file.size };
      },
    },
  ];
}
