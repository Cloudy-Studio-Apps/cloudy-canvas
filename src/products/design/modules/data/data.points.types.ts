import type { CanvasDocument } from "@canvas";

import type { DesignNode } from "../core";
import type { RawData, SourceContext } from "./services";
import type { SettingSpec } from "./settings";
import type { SettingValue } from "./source";
import type { ScopeLayer } from "./repeat/scope-layer.types";
import type { DataScope } from "./bindings/scope.types";
import type { DataFieldRenameHook } from "./repeat/field-renamer.types";

/** Where data comes from (a file, a link, a sheet). Built-ins and plugins register these. */
export interface DataSourceType {
  id: string;
  label: string;
  /** A lucide icon name; the UI maps it (engine code cannot import the UI's icon type). */
  icon: string;
  settings: SettingSpec[];
  defaultName(settings: Record<string, SettingValue>): string;
  /**
   * Where the source's secrets may be sent (a link's origin), or `null` when nowhere. Secrets
   * entered for one origin are bound to it: once the settings point at another they aren't sent
   * and read as missing until given again. Left out, secrets aren't bound.
   */
  secretOrigin?(settings: Record<string, SettingValue>): string | null;
  update(settings: Record<string, SettingValue>, ctx: SourceContext): Promise<RawData>;
}

/** How raw data becomes rows. */
export interface DataFormat {
  id: string;
  label: string;
  extensions: string[];
  mimes: string[];
  options?: SettingSpec[];
  sniff?(raw: RawData): boolean;
  parse(raw: RawData, options: Record<string, SettingValue>): Promise<unknown>;
}

/**
 * The loops around a top-level frame (a frame with no parent) that another module repeats, such
 * as a brochure's page and section repeats, outermost first; `null` (or `[]`) when it has none.
 * Its layers sit between the sources and the card repeaters inside the frame. Called once per
 * frame per sync pass, so it may read the document freely; `root` is the scope of the document's
 * sources the asker built, which the provider may read its lists in rather than build its own.
 * `root` is one object per pass: a provider whose answer needs a document-wide walk (a brochure's
 * expansion) memoizes it on `root` (a `WeakMap`), as catalog's does, so a pass walks once rather
 * than once per frame.
 */
export type DataScopeProvider = (
  doc: CanvasDocument,
  frame: DesignNode,
  root: DataScope,
) => readonly ScopeLayer[] | null;

/**
 * The language data in a layer is written in, asked of the layer's top-level ancestor (a page's
 * frame: a brochure's language); `null` leaves it to the next provider, else the app's.
 */
export type DataLocaleProvider = (doc: CanvasDocument, node: DesignNode) => string | null;

/** Both providers' entries and the field rename hooks, as the module host has them now. */
export interface DataAround {
  scopes: readonly DataScopeProvider[];
  locales: readonly DataLocaleProvider[];
  fieldRenames: readonly DataFieldRenameHook[];
}

/** A loop's preview row, stepped from the In scope view. */
export interface DataPreviewStep {
  /** The rows (or a page repeat's pages) the preview can show, ≥ 1. */
  count: number;
  /** The one it shows now, 0-based. */
  row: number;
  /** Shows `row` (0-based) in one undo step; throws when the edit is refused. */
  set(row: number): void;
}

/** Where a loop around a layer comes from, and how its preview row is stepped from that layer. */
export interface DataLoopPreview {
  /**
   * Where it comes from, as In scope names it ("Section Product", "Page Gallery"); left out for a
   * card repeater's loop (a module answering for a card on a page it made), which data names.
   */
  from?: string;
  /**
   * Its preview row's stepper, or `null` when the layer doesn't show that preview (it's in a copy
   * the loop made, whose row is fixed): In scope shows the row as text.
   */
  step: DataPreviewStep | null;
}

/**
 * A module's answer for a loop it puts around a layer (`ScopeLayer.owner` one of its sections or
 * pages): where it comes from and its preview row's stepper as seen from `nodeId`; `null` when the
 * loop isn't its own. The first answer wins; card repeaters are the data module's own.
 */
export type DataPreviewSetter = (
  doc: CanvasDocument,
  layer: ScopeLayer,
  nodeId: string,
) => DataLoopPreview | null;
