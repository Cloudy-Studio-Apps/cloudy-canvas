import {
  DOCUMENT_TOKENS,
  importConflicts,
  optionalBoolean,
  optionalChoice,
  optionalString,
  selectTokens,
  TokenStore,
  type ToolArgs,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { readTokenSource, type TokenFormat, type TokenSourceRead } from "../exchange";

const CHOICES = ["replace", "keep-both", "skip"] as const;

/** Exporting the file's tokens to a format, and importing them from a design or tokens JSON. */
export function exchangeTools(formats: () => readonly TokenFormat[]): DesignAgentTool[] {
  const writers = () => formats().filter((f) => f.write);
  const readers = () => formats().filter((f) => f.read);
  return [
    {
      name: "export_tokens",
      description:
        "The design's variables and styles as a file's text: dtcg (W3C Design Tokens JSON, " +
        "modes and ids in its extension so importing it back is exact), css (custom properties, " +
        "modes as [data-<axis>] blocks), tailwind (v4 @theme), scss, swift (SwiftUI), kotlin " +
        "(Compose). With `path`, writes it there instead of returning it.",
      inputSchema: {
        type: "object",
        required: ["format"],
        properties: {
          format: { type: "string", description: "dtcg, css, tailwind, scss, swift or kotlin." },
          path: { type: "string", description: "An absolute path to write the file to." },
        },
      },
      run: async (host, args) => {
        const { engine } = requireDesign(host);
        const id = optionalString(args, "format");
        const format = writers().find((f) => f.id === id);
        if (!format?.write) {
          throw new Error(
            `"format" must be one of: ${writers()
              .map((f) => f.id)
              .join(", ")}.`,
          );
        }
        const title = engine.doc.meta().title.trim() || "Design tokens";
        const text = format.write(TokenStore.of(engine.doc), title);
        const path = optionalString(args, "path");
        if (!path) return { format: format.id, text };
        await host.writeFile(path, new Blob([text], { type: "text/plain" }));
        return { format: format.id, path, bytes: text.length };
      },
    },
    {
      name: "import_tokens",
      description:
        "Brings variables and styles in from another .cdesign file or a tokens JSON file (W3C " +
        "DTCG or Tokens Studio, detected), one undo step. Ids are kept, so importing the same " +
        "source again updates what it added; collections and mode axes named like the file's " +
        "merge into them. Variables or styles named like the file's with other ids: `conflict` " +
        "replace (the default: the file's take the new values), keep-both or skip. What the " +
        "picked ones alias comes along. `preview: true` only reports what it would do.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "An absolute path to a .cdesign or .json file." },
          text: { type: "string", description: "Tokens JSON, instead of a path." },
          format: {
            type: "string",
            description: "auto (the default), dtcg or tokens-studio.",
          },
          collections: {
            type: "array",
            items: { type: "string" },
            description: "Only these collections (by name); all of them when left out.",
          },
          styles: { type: "boolean", description: "Bring the styles too (true by default)." },
          conflict: { type: "string", enum: [...CHOICES] },
          preview: { type: "boolean" },
        },
      },
      run: async (host, args) => {
        const { engine } = requireDesign(host);
        const source = await readSource(
          args,
          readers(),
          formats(),
          async (path) => host.readFile(path),
          engine.kinds,
        );
        const store = new TokenStore(source.records);
        const names = collectionNames(args);
        const unknown = names?.filter((n) => !store.collections().some((c) => c.name === n));
        if (unknown?.length) {
          throw new Error(
            `No collection named ${unknown.join(", ")} in the file; it has ` +
              `${
                store
                  .collections()
                  .map((c) => c.name)
                  .join(", ") || "none"
              }.`,
          );
        }
        const withStyles = optionalBoolean(args, "styles") ?? true;
        const selected = selectTokens(source.records, {
          collections: store
            .collections()
            .filter((c) => !names || names.includes(c.name))
            .map((c) => c.id),
          groups: [],
          styles: [],
          styleTypes: withStyles ? [...new Set(store.styles().map((s) => s.styleType))] : [],
        });
        const tokens = engine.service(DOCUMENT_TOKENS);
        const conflicts = importConflicts(tokens.store(), selected.records).map((c) => c.name);
        const choice = optionalChoice(args, "conflict", CHOICES) ?? "replace";
        const report = { format: source.label, conflicts, warnings: source.warnings };
        if (optionalBoolean(args, "preview")) {
          const count = selected.records.filter((r) => r.kind === "variable" || r.kind === "style");
          return { ...report, preview: true, tokens: count.length, extra: selected.extra };
        }
        const plan = tokens.importTokens(selected.records, choice);
        return { ...report, added: plan.added, updated: plan.updated, skipped: plan.skipped };
      },
    },
  ];
}

async function readSource(
  args: ToolArgs,
  readers: readonly TokenFormat[],
  all: readonly TokenFormat[],
  readFile: (path: string) => Promise<Uint8Array>,
  kinds: Parameters<typeof readTokenSource>[2],
): Promise<TokenSourceRead> {
  const path = optionalString(args, "path");
  const text = optionalString(args, "text");
  if (!path && text === undefined) throw new Error('Give a "path" or the "text" to import.');
  const bytes = path ? await readFile(path) : new TextEncoder().encode(text);
  const id = optionalString(args, "format") ?? "auto";
  if (id === "auto") return readTokenSource(bytes, all, kinds);
  const format = readers.find((f) => f.id === id);
  if (!format?.read) {
    throw new Error(`"format" must be auto or one of: ${readers.map((f) => f.id).join(", ")}.`);
  }
  return { label: format.label, ...format.read(new TextDecoder().decode(bytes)) };
}

function collectionNames(args: ToolArgs): string[] | null {
  const raw = args.collections;
  if (raw === undefined) return null;
  if (!Array.isArray(raw) || raw.some((n) => typeof n !== "string")) {
    throw new Error('"collections" must be a list of collection names.');
  }
  return raw as string[];
}
