import {
  type CollectionRecord,
  type ModeAxisRecord,
  type TokenCodeSyntax,
  type TokenScope,
  type TokenStore,
  type TokenValue,
  type ToolArgs,
  type VariableRecord,
} from "@canvas";

const SCOPES: ReadonlySet<string> = new Set<TokenScope>([
  "all-fills",
  "frame-fill",
  "shape-fill",
  "text-fill",
  "stroke-color",
  "effect-color",
  "corner-radius",
  "width-height",
  "gap",
  "padding",
  "stroke-weight",
  "opacity",
  "font-size",
  "line-height",
  "letter-spacing",
  "font-weight",
  "effect-value",
  "other-number",
]);

/** A variable by id, "Collection/path" or a path unique across collections; throws when unknown. */
export function requireVariable(store: TokenStore, ref: string): VariableRecord {
  const variable = store.find(ref);
  if (!variable) {
    throw new Error(`No variable "${ref}". Call list_variables for the names and ids.`);
  }
  return variable;
}

/** A collection by id or name; throws when unknown. */
export function requireCollection(store: TokenStore, ref: string): CollectionRecord {
  const collection = store.collection(ref) ?? store.collections().find((c) => c.name === ref);
  if (!collection) {
    throw new Error(`No collection "${ref}". Call list_variables for the collections.`);
  }
  return collection;
}

/** A mode axis by id or name; throws when unknown. */
export function requireAxis(store: TokenStore, ref: string): ModeAxisRecord {
  const axis = store.axis(ref) ?? store.axes().find((a) => a.name === ref);
  if (!axis) throw new Error(`No mode axis "${ref}". Call list_variables for the axes.`);
  return axis;
}

/** A mode of an axis by id or name; throws when unknown. */
export function requireMode(axis: ModeAxisRecord, ref: string): string {
  const mode = axis.modes.find((m) => m.id === ref || m.name === ref);
  if (!mode) {
    const names = axis.modes.map((m) => m.name).join(", ");
    throw new Error(`The axis ${axis.name} has no mode "${ref}" (modes: ${names}).`);
  }
  return mode.id;
}

/** A mode of any axis by id or name (unique across axes); throws when unknown. */
export function findMode(store: TokenStore, ref: string): string {
  const matches = store
    .axes()
    .flatMap((axis) => axis.modes.filter((m) => m.id === ref || m.name === ref));
  if (matches.length !== 1 || !matches[0]) {
    throw new Error(
      matches.length === 0
        ? `No mode "${ref}". Call list_variables for the axes and their modes.`
        : `Several axes have a mode "${ref}"; give its id.`,
    );
  }
  return matches[0].id;
}

/**
 * A value as agents give it: `"#3A83C9"` / `"#3A83C980"` for colors, a number, or
 * `{ alias: "variable ref" }` (resolved later, `lookup`).
 */
export function readTokenValue(raw: unknown, lookup: (ref: string) => string): TokenValue {
  if (typeof raw === "number") return { number: raw };
  if (typeof raw === "string") return { color: raw };
  if (typeof raw === "object" && raw !== null && typeof (raw as ToolArgs).alias === "string") {
    return { alias: lookup((raw as { alias: string }).alias) };
  }
  throw new Error('A value is a color ("#3A83C9"), a number, or { "alias": "variable" }.');
}

/** The scopes given (checked), or `undefined`. */
export function readScopes(raw: unknown): TokenScope[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw) || !raw.every((s) => typeof s === "string" && SCOPES.has(s))) {
    throw new Error(`"scopes" lists some of: ${[...SCOPES].join(", ")}.`);
  }
  return raw as TokenScope[];
}

/** The scope names, for schemas. */
export const SCOPE_NAMES = [...SCOPES];

/** Code names per platform as agents give them, checked; `undefined` when not given. */
export function readCodeSyntax(raw: unknown): TokenCodeSyntax | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error('"codeSyntax" is { web?, ios?, android? }.');
  }
  const syntax: TokenCodeSyntax = {};
  for (const platform of ["web", "ios", "android"] as const) {
    const value = (raw as Record<string, unknown>)[platform];
    if (value === undefined) continue;
    if (typeof value !== "string") throw new Error(`"codeSyntax.${platform}" is text.`);
    syntax[platform] = value;
  }
  return syntax;
}
