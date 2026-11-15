import type { ReactNode } from "react";

import type { CanvasDocument, CanvasElement } from "@canvas";
import type { PageElement } from "../page/page.types";

/** What a `pageSplitSteps` step gets while a page is split into a new file. */
export interface PageSplitContext {
  /** The design being split; read it, never write it. */
  source: CanvasDocument;
  /** The new file, still in memory: the page and its layers are already in it. */
  target: CanvasDocument;
  page: PageElement;
  /** The page's layers, as copied (same ids as in `source`). */
  nodes: readonly CanvasElement[];
  /** The design is in a project whose libraries are open; the new file joins the same project. */
  inProject: boolean;
  /**
   * Shows a dialog over the editor until `done` is called; resolves with what it got (`null`:
   * cancelled). For a step's `before`, e.g. to ask for properties of the new file.
   */
  dialog<T>(render: (done: (value: T | null) => void) => ReactNode): Promise<T | null>;
}

/**
 * Work a module or plugin does when a page is split into a new file (Split into new file in the
 * page's menu). A step with nothing to add for this page (checked by itself) does nothing.
 */
export interface PageSplitStep {
  id: string;
  /** Lowest first; 100 when unset. The built-ins: variables 10, design system 20, data 30. */
  order?: number;
  /**
   * Runs before anything is written, every step's before any `copy`. May ask with `ctx.dialog`.
   * Returns what `copy` gets as `prepared`, or `false` to cancel the split.
   */
  before?(ctx: PageSplitContext): unknown;
  /** Copies what this step owns into `ctx.target` (untracked writes). */
  copy?(ctx: PageSplitContext, prepared: unknown): void | Promise<void>;
}
