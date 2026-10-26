import {
  type CollectionRecord,
  type ModeAxisRecord,
  type TokenCodeSyntax,
  type TokenScope,
  type TokenStore,
  type TokenValue,
  type VariableRecord,
  type VariableType,
} from "../../tokens";
import { mapExpressionRefs, parseExpression } from "../../tokens/expression";
import type { ToolArgs } from "../mcp-tool.types";

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
  "text-content",
  "font-family",
  "font-style",
]);

/** A variable by id, "Collection/path" or a path unique across collections; throws when unknown. */
export function requireVariable(
  store: TokenStore,
  ref: string,
  listTool = "list_variables",
): VariableRecord {
  const variable = store.find(ref);
  if (!variable) {
    throw new Error(`No variable "${ref}". Call ${listTool} for the names and ids.`);
  }
  return variable;
}

/** A collection by id or name; throws when unknown. */
export function requireCollection(
  store: TokenStore,
  ref: string,
  listTool = "list_variables",
): CollectionRecord {
  const collection = store.collection(ref) ?? store.collections().find((c) => c.name === ref);
  if (!collection) {
    throw new Error(`No collection "${ref}". Call ${listTool} for the collections.`);
  }
  return collection;
}

/** A mode axis by id or name; throws when unknown. */
export function requireAxis(
  store: TokenStore,
  ref: string,
  listTool = "list_variables",
): ModeAxisRecord {
  const axis = store.axis(ref) ?? store.axes().find((a) => a.name === ref);
  if (!axis) throw new Error(`No mode axis "${ref}". Call ${listTool} for the axes.`);
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
export function findMode(store: TokenStore, ref: string, listTool = "list_variables"): string {
  const matches = store
    .axes()
    .flatMap((axis) => axis.modes.filter((m) => m.id === ref || m.name === ref));
  if (matches.length !== 1 || !matches[0]) {
    throw new Error(
      matches.length === 0
        ? `No mode "${ref}". Call ${listTool} for the axes and their modes.`
        : `Several axes have a mode "${ref}"; give its id.`,
    );
  }
  return matches[0].id;
}

/**
 * A value as agents give it for a variable of `type`: `"#3A83C9"` / `"#3A83C980"` for colors, a
 * number, a text, true or false, `{ alias: "variable ref" }` (resolved with `lookup`), or for
 * numbers `{ expr: "{Spacing/base} * 2" }` (each `{reference}` resolved with `lookup`).
 */
export function readTokenValue(
  raw: unknown,
  lookup: (ref: string) => string,
  type: VariableType,
): TokenValue {
  if (typeof raw === "object" && raw !== null && typeof (raw as ToolArgs).alias === "string") {
    return { alias: lookup((raw as { alias: string }).alias) };
  }
  if (typeof raw === "object" && raw !== null && typeof (raw as ToolArgs).expr === "string") {
    if (type !== "number") throw new Error(`Only number variables take an expression.`);
    const expr = (raw as { expr: string }).expr;
    try {
      parseExpression(expr);
    } catch (error) {
      throw new Error(`The expression ${expr} doesn't read: ${(error as Error).message}.`, {
        cause: error,
      });
    }
    return { expr: mapExpressionRefs(expr, lookup) };
  }
  if (type === "number" && typeof raw === "number") return { number: raw };
  if (type === "color" && typeof raw === "string") return { color: raw };
  if (type === "string" && typeof raw === "string") return { string: raw };
  if (type === "boolean" && typeof raw === "boolean") return { boolean: raw };
  throw new Error(
    `A ${type} variable's value is ${VALUE_HINTS[type]}, or { "alias": "variable" }${
      type === "number" ? ', or { "expr": "{variable} * 2" }' : ""
    }.`,
  );
}

const VALUE_HINTS: Readonly<Record<VariableType, string>> = {
  color: 'a color ("#3A83C9", "#3A83C980" with alpha)',
  number: "a number",
  string: "a text",
  boolean: "true or false",
};

/** The variable types agents name. */
export const VARIABLE_TYPES: readonly VariableType[] = ["color", "number", "string", "boolean"];

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
