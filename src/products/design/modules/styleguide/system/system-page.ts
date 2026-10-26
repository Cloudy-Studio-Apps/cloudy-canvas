import type { CanvasDocument, CanvasElement } from "@canvas";

import { allPagesOf, isPage } from "../../pages";
import type { StyleguideSettings, SystemPage } from "../sheet";

/** The settings of a system page that has none yet (or that are missing fields). */
export const DEFAULT_STYLEGUIDE_SETTINGS: StyleguideSettings = {
  order: [],
  hidden: [],
  choices: {},
  modeView: "current",
};

/** Whether an element is the Design system view's page: a hidden page with styleguide settings. */
export function isSystemPage(el: CanvasElement | undefined): el is SystemPage {
  if (!el || !isPage(el) || el.hidden !== true) return false;
  const settings = (el as { styleguide?: unknown }).styleguide;
  return typeof settings === "object" && settings !== null;
}

/** The design's system page, if it has one (made by the sync with the file's first token). */
export function systemPageOf(doc: CanvasDocument): SystemPage | undefined {
  return allPagesOf(doc).find(isSystemPage);
}

/** A system page's settings, with defaults for what's missing. */
export function settingsOf(page: SystemPage | undefined): StyleguideSettings {
  return { ...DEFAULT_STYLEGUIDE_SETTINGS, ...page?.styleguide };
}
