import { ReconcileError } from "../../db";
import type { ReconcileContext } from "./reconcile-context.types";
import { t } from "../er.i18n";

/** The id of a named entity (or aggregation); unknown names are an error until they're created. */
export function entityId(ctx: ReconcileContext, name: string, line: number): string {
  const id = ctx.entityIds.get(name);
  if (!id) {
    throw new ReconcileError(t("reconcile.unknownEntity", { name }), line);
  }
  return id;
}

export function relationId(ctx: ReconcileContext, name: string, line: number): string {
  const id = ctx.relationIds.get(name);
  if (!id) throw new ReconcileError(t("reconcile.unknownRelation", { name }), line);
  return id;
}
