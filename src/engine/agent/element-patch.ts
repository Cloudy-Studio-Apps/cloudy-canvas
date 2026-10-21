import { kindOf, type AnyElement, type ElementPatch } from "../elements";
import type { ToolArgs } from "./agent-tool.types";

const IMMUTABLE_FIELDS = new Set(["id", "type", "index"]);

/** Checks an agent's patch against the element it's for. */
export function elementPatch(el: AnyElement, patch: ToolArgs): ElementPatch {
  const kind = kindOf(el);
  for (const [key, value] of Object.entries(patch)) {
    if (IMMUTABLE_FIELDS.has(key)) throw new Error(`"${key}" can't be changed.`);
    if (kind.patchableFields && !kind.patchableFields.has(key)) {
      const allowed = [...kind.patchableFields].join(", ");
      throw new Error(`Only ${allowed} can be changed on ${el.type} elements.`);
    }
    if (!(key in el)) throw new Error(`A ${el.type} element has no "${key}" field.`);
    const current = (el as unknown as Record<string, unknown>)[key];
    if (current !== null && value !== null && typeof current !== typeof value) {
      throw new Error(`"${key}" must be a ${typeof current}.`);
    }
  }
  return patch as ElementPatch;
}
