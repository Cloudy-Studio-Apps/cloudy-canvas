import type { ActorWorkspace } from "@canvas";
import type { CallTracker } from "./track-agent-call.types";

/** Argument names that hold element ids (`id`, `ids`, `shapeId`, `parentIds`, …). */
const ID_KEY = /^(ids?|\w+Ids?)$/;
/** How deep ids are looked for in the arguments (`update_shapes`' `shapes[].id`). */
const MAX_DEPTH = 3;

/**
 * Watches a tool call in its agent's workspace: the elements it changes, and the ones its
 * arguments name, so read and zoom calls point somewhere too. Calls running at the same time see
 * each other's changes; each takes what changed while it ran.
 */
export function trackAgentCall(
  workspace: ActorWorkspace<object>,
  args: Record<string, unknown>,
): CallTracker {
  const changed = new Set<string>();
  const stop = workspace.doc.observe(({ updated }) => {
    for (const id of updated) changed.add(id);
  });
  const named = new Set<string>();
  collectIds(args, named, 0);

  return {
    finish() {
      stop();
      const existing = [...changed].filter((id) => workspace.getElement(id));
      const bounds = workspace.elementsBounds(existing) ?? workspace.elementsBounds(named);
      return { changed: existing, bounds };
    },
  };
}

function collectIds(value: unknown, into: Set<string>, depth: number): void {
  if (depth > MAX_DEPTH || typeof value !== "object" || value === null) return;
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, into, depth + 1);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (ID_KEY.test(key)) {
      if (typeof item === "string") into.add(item);
      else if (Array.isArray(item)) {
        for (const id of item) if (typeof id === "string") into.add(id);
      }
    } else collectIds(item, into, depth + 1);
  }
}
