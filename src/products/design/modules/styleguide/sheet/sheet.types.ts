import type { FrameElement } from "../../frame";
import type { PageElement } from "../../pages";

/**
 * What the styleguide writes on each layer it generates (as `generated`): the sheet it belongs to
 * and its place in the sheet's content, which regenerating matches by.
 */
export interface GeneratedMark {
  sheet: string;
  key: string;
}

/** What makes a frame a live design-system element (stored as its `sheet` field). */
export interface TokenSheet {
  /** The category it shows (`StyleguideCategory.id`). */
  category: string;
  /** One group of it (a `SheetGroup` id); unset is the whole category. */
  group?: string;
  /** Its own template, or `null` for the one configured for its source (see `templateChoice`). */
  template: string | null;
  /** Its own template's options; `null` uses the configured ones. */
  options: Record<string, unknown> | null;
  /** One column for the modes in effect, or one per mode side by side. */
  modeView: SheetModeView;
  /** A hash of the content last generated (`""`: never generated). */
  hash: string;
}

export type SheetModeView = "current" | "all";

/** A frame that is a live design-system element. */
export type SheetFrame = FrameElement & { sheet: TokenSheet };

/** A template and its options, as picked for a category or a group. */
export interface TemplateChoice {
  template: string;
  options: Record<string, unknown>;
}

/** How the Design system view is set up (stored as `styleguide` on the system page). */
export interface StyleguideSettings {
  /** Category ids in the user's order; categories missing from it follow in their own order. */
  order: string[];
  /** Hidden categories (`"colors"`) and groups (`"colors:<group id>"`). */
  hidden: string[];
  /** Template choices: a category's default (`"colors"`) or a group's override (`"colors:<group id>"`). */
  choices: Record<string, TemplateChoice>;
  /** Whether the view's sheets show every mode side by side. */
  modeView: SheetModeView;
}

/** The hidden page the Design system view shows, with its settings. */
export type SystemPage = PageElement & { hidden: true; styleguide: StyleguideSettings };
