import { optionalBoolean } from "@canvas";

import type { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";
import { readSizeLimits, readSizing } from "./layout-args";

/**
 * How a node sizes in an auto layout, from an agent's spec or patch: `sizing` (hugging only
 * where the kind can: an auto layout frame; a text hugs through its `autoResize`),
 * `layoutAbsolute` and `sizeLimits`. Only the fields given.
 */
export function readNodeLayoutFields(
  kind: DesignNodeKind,
  node: DesignNode,
  args: Record<string, unknown>,
): Partial<Pick<DesignNode, "sizing" | "layoutAbsolute" | "sizeLimits">> {
  const fields: Partial<Pick<DesignNode, "sizing" | "layoutAbsolute" | "sizeLimits">> = {};
  if (args.sizing !== undefined) {
    const sizing = readSizing(args.sizing, node.sizing);
    for (const axis of ["h", "v"] as const) {
      if (sizing[axis] !== "hug" || kind.hugs({ ...node, sizing }, axis)) continue;
      throw new Error(
        `A ${kind.label} can't hug its ${axis === "h" ? "width" : "height"}: only auto layout ` +
          'frames can (texts hug through "autoResize").',
      );
    }
    fields.sizing = sizing;
  }
  const absolute = optionalBoolean(args, "layoutAbsolute");
  if (absolute !== undefined) fields.layoutAbsolute = absolute;
  if (args.sizeLimits !== undefined) fields.sizeLimits = readSizeLimits(args.sizeLimits);
  return fields;
}
