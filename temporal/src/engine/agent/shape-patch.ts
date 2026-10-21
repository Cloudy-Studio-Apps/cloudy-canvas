import type { Shape, ShapePatch, ShapeType } from "../document";
import { measureText } from "../text";
import type { ToolArgs } from "./agent-tool.types";

const IMMUTABLE_FIELDS = new Set(["id", "type", "index"]);
/** Shapes whose content is edited through their text views (DBML, ER text); only moves are allowed here. */
const MOVE_ONLY: ReadonlySet<ShapeType> = new Set([
  "db-table",
  "db-enum",
  "er-entity",
  "er-relation",
  "er-attribute",
  "stroke",
]);
const MOVE_FIELDS = new Set(["x", "y"]);

/** Checks an agent's patch against the shape it's for. Text shapes resize to their new text. */
export function shapePatch(shape: Shape, patch: ToolArgs): ShapePatch {
  for (const [key, value] of Object.entries(patch)) {
    if (IMMUTABLE_FIELDS.has(key)) throw new Error(`"${key}" can't be changed.`);
    if (MOVE_ONLY.has(shape.type) && !MOVE_FIELDS.has(key)) {
      throw new Error(
        `Only x and y can be changed on ${shape.type} shapes here. ` +
          "Edit tables and enums with the DBML tools and ER diagrams with apply_er_text.",
      );
    }
    if (!(key in shape)) throw new Error(`A ${shape.type} shape has no "${key}" field.`);
    const current = (shape as unknown as Record<string, unknown>)[key];
    if (current !== null && value !== null && typeof current !== typeof value) {
      throw new Error(`"${key}" must be a ${typeof current}.`);
    }
  }
  const result = patch as ShapePatch;
  if (shape.type === "text" && (result.text !== undefined || result.fontSize !== undefined)) {
    return {
      ...result,
      ...measureText(result.text ?? shape.text, result.fontSize ?? shape.fontSize),
    };
  }
  return result;
}
