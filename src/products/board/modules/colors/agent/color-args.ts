import {
  DEFAULT_VALUE,
  findMode,
  readTokenValue,
  requireAxis,
  requireVariable,
  type DocumentTokens,
  type ToolArgs,
  type VariableRecord,
} from "@canvas";

/** Where the board's color tools point agents for names and ids. */
export const LIST_TOOL = "list_board_colors";

/** A board color by id, `Collection/path` or a unique path; throws for unknown ones and non-colors. */
export function requireColor(tokens: DocumentTokens, ref: string): VariableRecord {
  const variable = requireVariable(tokens.store(), ref, LIST_TOOL);
  if (variable.type !== "color") throw new Error(`"${variable.name}" isn't a color.`);
  return variable;
}

export const COLOR_VALUE = {
  description:
    'A color ("#3A83C9", "#3A83C980" with alpha), or { "alias": "color" } to follow another.',
};

/** The value fields of a board color, for create and update. */
export const COLOR_VALUE_FIELDS = {
  value: { ...COLOR_VALUE, description: `Its default color. ${COLOR_VALUE.description}` },
  values: {
    type: "object",
    description:
      'Colors for modes by name (e.g. { "Dark": "#121212" }); the color then varies by their axis.',
    additionalProperties: COLOR_VALUE,
  },
  variesBy: {
    type: ["string", "null"],
    description: "The mode axis it varies by (null: none; its mode colors go).",
  },
};

/** Writes an agent's `variesBy`, `value` and `values` on a board color (aliases resolved). */
export function writeColorValues(tokens: DocumentTokens, id: string, item: ToolArgs): void {
  const lookup = (ref: string) => requireColor(tokens, ref).id;
  if (item.variesBy !== undefined) {
    const axis =
      item.variesBy === null ? null : requireAxis(tokens.store(), String(item.variesBy), LIST_TOOL);
    tokens.setVariableAxis(id, axis?.id ?? null);
  }
  if (item.value !== undefined) {
    tokens.setValue(id, DEFAULT_VALUE, readTokenValue(item.value, lookup, "color"));
  }
  if (item.values !== undefined) {
    if (typeof item.values !== "object" || item.values === null) {
      throw new Error('"values" maps mode names to colors.');
    }
    for (const [mode, raw] of Object.entries(item.values as ToolArgs)) {
      tokens.setValue(
        id,
        findMode(tokens.store(), mode, LIST_TOOL),
        readTokenValue(raw, lookup, "color"),
      );
    }
  }
}
