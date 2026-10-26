import type { CanvasElement, ElementBuildContext, ElementPatch } from "../elements";
import type { ToolArgs } from "./mcp-tool.types";
import { resizePatch } from "./resize-patch";

const IMMUTABLE_FIELDS = new Set(["id", "type", "index"]);

/**
 * Checks an agent's patch against the element it's for. A new `w`/`h` goes through the kind's
 * `resize` (so proportions, minimums and grids follow), then the kind completes and validates it.
 * Fields a kind allows but the element doesn't store (e.g. a connector's `from`) are left to the
 * kind's `completePatch`.
 */
export function elementPatch(
  context: ElementBuildContext,
  el: CanvasElement,
  patch: ToolArgs,
): ElementPatch {
  const kind = context.kinds.kindOf(el);
  for (const [key, value] of Object.entries(patch)) {
    if (IMMUTABLE_FIELDS.has(key)) throw new Error(`"${key}" can't be changed.`);
    if (kind.patchableFields && !kind.patchableFields.has(key)) {
      const allowed = [...kind.patchableFields].join(", ");
      throw new Error(`Only ${allowed} can be changed on ${el.type} elements.`);
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error(`"${key}" must be a finite number.`);
    }
    const stored = key in el;
    if (!stored && kind.patchableFields?.has(key)) continue;
    if (!stored) throw new Error(`A ${el.type} element has no "${key}" field.`);
    const current = (el as unknown as Record<string, unknown>)[key];
    if (current !== null && value !== null && typeof current !== typeof value) {
      throw new Error(`"${key}" must be ${typeName(current)}.`);
    }
  }
  return kind.completePatch(el, resizePatch(kind, el, patch), context);
}

function typeName(value: unknown): string {
  if (Array.isArray(value)) return "an array";
  const type = typeof value;
  return type === "object" ? "an object" : `a ${type}`;
}
