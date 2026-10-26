import {
  codeTokens,
  DOCUMENT_TOKENS,
  importConflicts,
  optionalBoolean,
  optionalChoice,
  optionalString,
  selectTokens,
  toCss,
  toDtcg,
  TokenStore,
  type ImportChoice,
} from "@canvas";

import { readColorSource } from "../../../tokens";
import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

const CHOICES: readonly ImportChoice[] = ["replace", "keep-both", "skip"];

/** Bringing colors in from a design, a board or tokens JSON, and writing them out. */
export const colorsExchangeTools: BoardMcpTool[] = [
  {
    name: "import_board_colors",
    description:
      "Brings colors into the board from a .cdesign or .cboard file or tokens JSON (W3C DTCG or " +
      "Tokens Studio, detected): only color variables, with the collections and mode axes they " +
      "use, one undo step. Ids are kept, so importing the same source again updates what it " +
      "added. Colors named like the board's with other ids: `conflict` replace (the default), " +
      "keep-both or skip. `preview: true` only reports what it would do.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "An absolute path to a .cdesign, .cboard or .json." },
        text: { type: "string", description: "Tokens JSON, instead of a path." },
        collections: {
          type: "array",
          items: { type: "string" },
          description: "Only these collections (by name); all of them when left out.",
        },
        conflict: { type: "string", enum: [...CHOICES] },
        preview: { type: "boolean" },
      },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const path = optionalString(args, "path");
      const text = optionalString(args, "text");
      if (!path && text === undefined) throw new Error('Give a "path" or the "text" to import.');
      const source = readColorSource(
        path ? await host.readFile(path) : new TextEncoder().encode(text),
      );
      const store = new TokenStore(source.records);
      const names = args.collections;
      if (
        names !== undefined &&
        (!Array.isArray(names) || names.some((n) => typeof n !== "string"))
      ) {
        throw new Error('"collections" must be a list of collection names.');
      }
      const picked = names as string[] | undefined;
      const unknown = picked?.filter((n) => !store.collections().some((c) => c.name === n));
      if (unknown?.length) {
        const has =
          store
            .collections()
            .map((c) => c.name)
            .join(", ") || "none";
        throw new Error(`No collection named ${unknown.join(", ")} in the file; it has ${has}.`);
      }
      const selected = selectTokens(source.records, {
        collections: store
          .collections()
          .filter((c) => !picked || picked.includes(c.name))
          .map((c) => c.id),
        groups: [],
        styles: [],
        styleTypes: [],
      });
      const tokens = engine.service(DOCUMENT_TOKENS);
      const conflicts = importConflicts(tokens.store(), selected.records).map((c) => c.name);
      const report = { format: source.label, conflicts, warnings: source.warnings };
      if (optionalBoolean(args, "preview")) {
        const colors = selected.records.filter((r) => r.kind === "variable").length;
        return { ...report, preview: true, colors };
      }
      const choice = optionalChoice(args, "conflict", CHOICES) ?? "replace";
      const plan = tokens.importTokens(selected.records, choice);
      return { ...report, added: plan.added, updated: plan.updated, skipped: plan.skipped };
    },
  },
  {
    name: "export_board_colors",
    description:
      "The board's colors as a file's text: dtcg (W3C Design Tokens JSON; a design imports it " +
      "back exactly) or css (custom properties, modes as [data-<axis>] blocks). With `path`, " +
      "writes it there instead of returning it.",
    inputSchema: {
      type: "object",
      required: ["format"],
      properties: {
        format: { type: "string", enum: ["dtcg", "css"] },
        path: { type: "string", description: "An absolute path to write the file to." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const format = optionalChoice(args, "format", ["dtcg", "css"] as const);
      if (!format) throw new Error('"format" must be dtcg or css.');
      const store = TokenStore.of(engine.doc);
      const title = engine.doc.meta().title.trim() || "Board colors";
      const text =
        format === "dtcg"
          ? JSON.stringify(toDtcg(store), null, 2)
          : toCss(codeTokens(store, title));
      const path = optionalString(args, "path");
      if (!path) return { format, text };
      await host.writeFile(path, new Blob([text], { type: "text/plain" }));
      return { format, path, bytes: text.length };
    },
  },
];
