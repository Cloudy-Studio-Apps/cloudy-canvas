import type { ElementPatch } from "../elements";
import type { AgentPatchHost, AgentUpdate } from "./agent-patches.types";
import { elementPatch } from "./element-patch";

/**
 * The document patches for an agent's updates, all checked before anything is written. An
 * element given a new `x`/`y` takes what moves with it along, as dragging it does: a section's
 * contents, an entity's attributes, what an aggregation holds.
 */
export function agentPatches(
  host: AgentPatchHost,
  updates: readonly AgentUpdate[],
): Map<string, ElementPatch> {
  const context = { kinds: host.kinds, lookup: (ref: string) => host.getElement(ref) };
  const patches = new Map<string, ElementPatch>();
  for (const { id, patch } of updates) {
    const el = host.doc.get(id);
    if (!el) throw new Error(`No shape with id ${id}.`);
    patches.set(id, elementPatch(context, el, patch));
  }
  const updated = new Set(patches.keys());
  for (const id of updated) moveMembers(host, id, patches, updated);
  return patches;
}

function moveMembers(
  host: AgentPatchHost,
  id: string,
  patches: Map<string, ElementPatch>,
  updated: ReadonlySet<string>,
): void {
  const patch = patches.get(id);
  // Derived elements (aggregation boxes) are moved by their members, so measure from the scene.
  const el = host.getElement(id);
  if (!patch || !el) return;
  const dx = typeof patch.x === "number" ? patch.x - el.x : 0;
  const dy = typeof patch.y === "number" ? patch.y - el.y : 0;
  if (dx === 0 && dy === 0) return;
  for (const memberId of host.withMembers([id], "move")) {
    if (memberId === id || updated.has(memberId) || patches.has(memberId)) continue;
    const member = host.doc.get(memberId);
    if (member) patches.set(memberId, host.kinds.kindOf(member).move(member, dx, dy));
  }
}
