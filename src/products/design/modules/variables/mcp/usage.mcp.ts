import {
  asUndoStep,
  DOCUMENT_TOKENS,
  requireToken,
  stringArg,
  stringList,
  tokenName,
  type ToolArgs,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { countedUse, DESIGN_PAGES } from "../../pages";

const TOKEN = { type: "string", description: "A variable or a style, by id or name." };

/** Where tokens are used, unused ones, replacing and detaching them. */
export const usageTools: DesignMcpTool[] = [
  {
    name: "get_token_usage",
    description:
      "Where a variable or a style is used: layers bound to it (by page), layers using it " +
      "through a style, variables aliasing it, styles using it and generators following it.",
    inputSchema: { type: "object", required: ["token"], properties: { token: TOKEN } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const token = requireToken(store, stringArg(args, "token"));
      const usage = tokens.usageOf(token.id, countedUse(engine.doc));
      const layers = [...usage.layers, ...usage.viaStyles];
      const pages = engine
        .service(DESIGN_PAGES)
        .pages()
        .map((page) => ({
          page: page.id,
          name: page.name,
          layers: layers.filter(
            (id) => (engine.doc.get(id) as { pageId?: string } | undefined)?.pageId === page.id,
          ),
        }))
        .filter((page) => page.layers.length > 0);
      return {
        token: tokenName(store, token.id),
        pages,
        viaStyles: usage.viaStyles.length,
        aliases: usage.aliases.map((id) => tokenName(store, id)),
        styles: usage.styles.map((id) => tokenName(store, id)),
        generators: usage.generators.length,
      };
    },
  },
  {
    name: "find_unused_tokens",
    description:
      "The variables and styles nothing uses (no layer, alias, style or generator), to clean up " +
      "with delete_variables / delete_styles.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      return {
        unused: tokens.unused(countedUse(engine.doc)).map((id) => ({
          id,
          name: tokenName(store, id),
          kind: store.style(id) ? "style" : "variable",
        })),
      };
    },
  },
  {
    name: "replace_token",
    description:
      "Moves every use of a variable (or style) to another of its type, as one undo step: layers, " +
      "variables aliasing it, styles using it, generators and contrast pairs. The first stays " +
      "(delete it after if unused). Refused when the second aliases the first (a loop).",
    inputSchema: {
      type: "object",
      required: ["from", "to"],
      properties: { from: TOKEN, to: TOKEN },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const from = requireToken(store, stringArg(args, "from"));
      const to = requireToken(store, stringArg(args, "to"));
      const layers = asUndoStep(engine.doc, () =>
        tokens.replaceUses(from.id, to.id, countedUse(engine.doc)),
      );
      return { replaced: tokenName(store, from.id), with: tokenName(store, to.id), layers };
    },
  },
  {
    name: "detach_tokens",
    description:
      "Unlinks layers from variables and styles, keeping what they show, as one undo step: " +
      "`tokens` everywhere (the tokens stay in the file), or `layers` (all their variables and " +
      "styles, or only `tokens` with both given).",
    inputSchema: {
      type: "object",
      properties: {
        tokens: { type: "array", items: TOKEN },
        layers: { type: "array", items: { type: "string" } },
      },
    },
    run: (host, args: ToolArgs) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      const ids =
        args.tokens === undefined
          ? undefined
          : stringList(args, "tokens").map((ref) => requireToken(store, ref).id);
      if (args.layers !== undefined) {
        const layers = stringList(args, "layers");
        const unlinked = asUndoStep(engine.doc, () => tokens.detachLayers(layers, ids));
        return { unlinked };
      }
      if (!ids) throw new Error('Give "tokens", "layers", or both.');
      asUndoStep(engine.doc, () => tokens.detachTokens(ids, countedUse(engine.doc)));
      return { detached: ids.map((id) => tokenName(store, id)) };
    },
  },
];
