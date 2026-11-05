import type { CanvasElement } from "@canvas";

import type { DesignNode } from "../../core";
import type { FrameElement } from "../../frame";
import type { DataScope } from "../bindings";
import type { RepeatRow, RepeatRows, RepeatSettings, RowNames } from "./repeat.types";
import type { ScopeLayer } from "./scope-layer.types";

/** An iterator as one sync reads it: its rows (computed once) and the child they repeat. */
export interface IteratorRows {
  repeat: RepeatSettings;
  /** The scope the frame itself reads, which its `source` is looked up in. */
  scope: DataScope;
  rows: RepeatRows;
  byKey: ReadonlyMap<string, RepeatRow>;
  /** The position of the row the template shows: `previewRow` when it's in range, else 0. */
  preview: number;
  /** What the row name carries (its fields and source), made once for every row's scope. */
  names: RowNames;
  template: DesignNode | null;
  /**
   * Its list reads a source this device can't read (`readsUnreadable`): its copies are kept as
   * they are, and its row name reads as unreadable inside it, so nested iterators wait too.
   */
  unreadable: boolean;
}

/** What a top-level frame has around it: the providers' layers and the scope inside them. */
export interface LoopsAround {
  layers: readonly ScopeLayer[];
  scope: DataScope;
}

/**
 * The scopes of one document's layers, made once per sync (or per question) over one root
 * scope: each iterator's rows are computed once and each layer's scope is found by walking up
 * its ancestors, remembered on the way, so nothing rescans the document per layer.
 */
export interface DataScopes {
  /** The scope they're made over: every source by name. */
  readonly root: DataScope;
  /** The scope a layer's expressions read: the root's, and a row's for each iterator around it. */
  scopeFor(el: CanvasElement): DataScope;
  /**
   * Every loop around a layer, outermost first: the ones other modules put around its top-level
   * frame (`dataScopeProviders`), then each card repeater it is the template or a copy of (owner
   * the frame's id, label its name, the copy's row or the template's preview row).
   */
  layersFor(el: CanvasElement): ScopeLayer[];
  /**
   * The language a layer's data is written in, from `dataLocaleProviders` asked about its
   * top-level ancestor (once each); `null` when none answers (the app's language).
   */
  localeFor(el: CanvasElement): string | null;
  /** A frame's repeat and its rows, `null` when it repeats nothing. */
  iterator(frame: FrameElement): IteratorRows | null;
  /** A layer's children by sibling order. */
  children(id: string): readonly DesignNode[];
  /** The child a frame repeats (`templateOf`: the one its repeat names, else its first own child). */
  templateOf(frame: FrameElement): DesignNode | null;
  /**
   * Forgets the layer tree after writes. Rows stay (the data doesn't change within a sync) but
   * for `frames`, whose `repeat` was written.
   */
  invalidate(frames?: readonly string[]): void;
}
