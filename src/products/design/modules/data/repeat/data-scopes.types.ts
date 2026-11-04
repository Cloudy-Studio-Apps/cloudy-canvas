import type { CanvasElement } from "@canvas";

import type { DesignNode } from "../../core";
import type { FrameElement } from "../../frame";
import type { DataScope } from "../bindings";
import type { RepeatRow, RepeatRows, RepeatSettings } from "./repeat.types";

/** An iterator as one sync reads it: its rows (computed once) and the child they repeat. */
export interface IteratorRows {
  repeat: RepeatSettings;
  /** The scope the frame itself reads, which its `source` is looked up in. */
  scope: DataScope;
  rows: RepeatRows;
  byKey: ReadonlyMap<string, RepeatRow>;
  /** The position of the row the template shows: `previewRow` when it's in range, else 0. */
  preview: number;
  template: DesignNode | null;
}

/**
 * The scopes of one document's layers, made once per sync (or per question) over one root
 * scope: each iterator's rows are computed once and each layer's scope is found by walking up
 * its ancestors, remembered on the way, so nothing rescans the document per layer.
 */
export interface DataScopes {
  /** The scope a layer's expressions read: the root's, and a row's for each iterator around it. */
  scopeFor(el: CanvasElement): DataScope;
  /** A frame's repeat and its rows, `null` when it repeats nothing. */
  iterator(frame: FrameElement): IteratorRows | null;
  /** A layer's children by sibling order. */
  children(id: string): readonly DesignNode[];
  /** The child a frame repeats: its first child that isn't one of its copies. */
  templateOf(frame: FrameElement): DesignNode | null;
  /**
   * Forgets the layer tree after writes. Rows stay (the data doesn't change within a sync) but
   * for `frames`, whose `repeat` was written.
   */
  invalidate(frames?: readonly string[]): void;
}
