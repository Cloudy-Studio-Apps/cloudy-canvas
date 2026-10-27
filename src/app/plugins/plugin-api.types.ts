import type * as board from "@board";
import type * as boardUi from "@board/ui";
import type * as canvas from "@canvas";
import type * as canvasUi from "@canvas-ui";
import type * as design from "@design";
import type * as designUi from "@design/ui";
import type * as sharedCore from "@shared/core";
import type { PluginManifest } from "@shared/core";
import type * as pluginLibs from "./api/plugin-libs";
import type * as pluginPlatform from "./api/plugin-platform";
import type * as pluginUi from "./api/plugin-ui";
import type { PluginStickersApi } from "./plugin-stickers.types";
import type { PluginThemesApi } from "./plugin-themes.types";

/**
 * What a plugin's `activate(api)` gets: the app's own building blocks, so a plugin needs no
 * imports (and shares the app's React). Each group is a barrel, whole, so a plugin reaches what a
 * built-in feature imports; `ui`, `platform` and `libs` are curated (`api/`). Version 1
 * (`PLUGIN_API_VERSION`).
 */
export interface PluginApi {
  apiVersion: number;
  plugin: {
    id: string;
    manifest: PluginManifest;
    /** A file in the plugin's folder (e.g. an icon), relative to it. */
    readAsset(path: string): Promise<Uint8Array>;
    /** Reads a text file in the plugin's folder (e.g. an SVG icon or `locales/en.json`). */
    readText(path: string): Promise<string>;
  };
  /** `@shared/core`: the module API, ids, translations (`defineMessages`, `getLocale`, `tCommon`), … */
  core: typeof sharedCore;
  /** `@canvas`: the engine (kinds, tools, geometry, paths, text, export, variables, …). */
  canvas: typeof canvas;
  /** `@canvas-ui`: the shared editor pieces (`ColorField`, `ModeToolbar`, `useEngine`, …). */
  canvasUi: typeof canvasUi;
  /** Notices, the loading overlay, the code editor, the brand seals and the kit (`ui.kit`). */
  ui: typeof pluginUi;
  /** Files, images, HTTP, links, the clipboard and fonts. */
  platform: typeof pluginPlatform;
  /** The app's React, `createPortal`, lucide `icons`, zustand's `createStore`/`persist`, `StreamLanguage`. */
  libs: typeof pluginLibs;
  /** `@board` and `@board/ui`: the board's points, palette, MCP plumbing and editor pieces. */
  board: typeof board & typeof boardUi;
  /** `@design` and `@design/ui`: the design's points, node base, MCP plumbing and editor pieces. */
  design: typeof design & typeof designUi;
  /** Sticker groups and sets, staged until `activate` returns. */
  stickers: PluginStickersApi;
  /** Themes for Settings › Appearance (`register`), and the active theme. */
  themes: PluginThemesApi;
}

/** What `createPluginApi` hands out of the plugin's stages. */
export interface PluginStaged {
  stickers: PluginStickersApi;
  themes: PluginThemesApi;
}

/** A plugin's code: its default export. */
export type PluginActivate = (api: PluginApi) => unknown;
