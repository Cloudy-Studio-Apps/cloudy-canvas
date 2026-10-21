import { ReconcileError } from "../db/reconcile-error";
import type { ReconcileContext } from "./reconcile-context.types";

/** The id of a named entity (or aggregation); unknown names are an error until they're created. */
export function entityId(ctx: ReconcileContext, name: string, line: number): string {
  const id = ctx.entityIds.get(name);
  if (!id) {
    throw new ReconcileError(
      `Unknown entity "${name}" (it's created when you leave the editor)`,
      line,
    );
  }
  return id;
}

export function relationId(ctx: ReconcileContext, name: string, line: number): string {
  const id = ctx.relationIds.get(name);
  if (!id) throw new ReconcileError(`Unknown relation "${name}"`, line);
  return id;
}
