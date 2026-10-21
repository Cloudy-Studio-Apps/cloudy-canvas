import type { DbmlError } from "../db";
import type { ErShapes } from "./lang";

export interface ErPlan {
  /** Final content of every ER shape. Kept shapes keep their center; new ones still need a position. */
  shapes: ErShapes;
  added: Set<string>;
  removed: string[];
}

export type ErReconcileResult = { ok: true; plan: ErPlan } | { ok: false; error: DbmlError };

export type ErApplyResult = { ok: true; warnings: DbmlError[] } | { ok: false; error: DbmlError };
