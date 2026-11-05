import type { CanvasDocument } from "@canvas";

import type { DataScope } from "../bindings/scope.types";
import type { PathStep } from "../table/read-path.types";

/** A renamed field: how many steps its old path has and its new path's steps. */
export interface FieldMove {
  length: number;
  to: PathStep[];
}

/** A path rewritten, or `null` to keep it. */
export type PathRewrite = (path: string) => string | null;

/**
 * Rewrites what reads a source's renamed fields (its shape step changed): each expression is read
 * in its scope, so `product[0].attributes.title`, `item.attributes.title` inside a repeat over
 * `product`, or a brochure section's row, all follow `attributes.title` → `name`. Only fields of
 * that source change; another source's field of the same name, or a list's item fields, don't.
 */
export interface DataFieldRenamer {
  /** The scope of the document's sources the expressions are read from (as they were). */
  readonly root: DataScope;
  /** `expr` read in `scope` with its renamed field rewritten, `null` when it reads none. */
  expr(scope: DataScope, expr: string): string | null;
  /** A text's `{…}` tokens read in `scope` rewritten, `null` when none changed. */
  text(scope: DataScope, text: string): string | null;
  /**
   * A stored repeat with its `source` (read in `scope`) and row paths (`key`, `filter`, `sort`,
   * read in its row's scope) rewritten, `null` when none changed. `as` names the row when the
   * stored one is empty (a brochure repeat's default).
   */
  repeat(scope: DataScope, repeat: unknown, as?: string): Record<string, unknown> | null;
  /** The scope inside a loop over `source` (read in `scope`), its row under `as`. */
  rowScope(scope: DataScope, source: string, as: string): DataScope;
}

/**
 * A module's part of a field rename (`dataFieldRenames`): it rewrites, with `renamer`, the
 * expressions it keeps outside layers (a brochure's section and page repeats, section names),
 * writing with `doc.update`/`updateMany` inside the caller's undo step (no `checkpoint`).
 */
export type DataFieldRenameHook = (doc: CanvasDocument, renamer: DataFieldRenamer) => void;
