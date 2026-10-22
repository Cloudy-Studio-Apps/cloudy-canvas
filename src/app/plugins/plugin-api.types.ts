import type * as React from "react";

import type * as canvas from "@canvas";
import type * as canvasUi from "@canvas-ui";
import type * as board from "@board";
import type { createId, defineModule, definePoint, PluginManifest } from "@shared/core";
import type { notifyError, toast } from "@shared/stores/toast-store";
import type { boardLibrary, toolItem } from "@board/ui/components/library";
import type { boardEditor } from "@board/ui";

/**
 * What a plugin's `activate(api)` gets: the app's own building blocks, so a plugin needs no
 * imports (and shares the app's React). Version 1 (`PLUGIN_API_VERSION`).
 */
export interface PluginApi {
  apiVersion: number;
  plugin: {
    id: string;
    manifest: PluginManifest;
    /** A file in the plugin's folder (e.g. an icon), relative to it. */
    readAsset(path: string): Promise<Uint8Array>;
    /** Reads a text file in the plugin's folder (e.g. an SVG icon). */
    readText(path: string): Promise<string>;
  };
  core: {
    defineModule: typeof defineModule;
    definePoint: typeof definePoint;
    createId: typeof createId;
  };
  canvas: Pick<
    typeof canvas,
    | "ElementKind"
    | "BoxKind"
    | "TextBoxKind"
    | "LineKind"
    | "ELEMENT_DEFAULTS"
    | "createElementBase"
    | "defineService"
    | "selectAndEdit"
    | "asUndoStep"
    | "buildElement"
    | "summarizeElement"
    | "stringArg"
    | "optionalString"
    | "optionalNumber"
    | "optionalBoolean"
    | "optionalChoice"
    | "stringList"
    | "optionalRecord"
    | "recordList"
  >;
  ui: {
    React: typeof React;
    toast: typeof toast;
    notifyError: typeof notifyError;
  } & Pick<
    typeof canvasUi,
    | "FloatingPanel"
    | "PanelDivider"
    | "ToolButton"
    | "OptionButton"
    | "ColorSwatch"
    | "ColorPalette"
    | "ExtensionIconView"
    | "useEngine"
    | "useEngineState"
    | "useService"
    | "useEngineElement"
  >;
  board: {
    /** The board's canvas points (kinds, tools, options, hooks, …). */
    canvas: typeof board.boardCanvas;
    /** The board editor's points (toolbar, panels, top bar, overlays, …). */
    editor: typeof boardEditor;
    agentTools: typeof board.boardAgentTools;
    library: typeof boardLibrary;
    toolItem: typeof toolItem;
    requireBoard: typeof board.requireBoard;
    palette: Pick<
      typeof board,
      "STICKY_COLORS" | "SHAPE_FILLS" | "SHAPE_STROKES" | "LINE_COLORS" | "INK_COLOR"
    >;
  };
}

/** A plugin's code: its default export. */
export type PluginActivate = (api: PluginApi) => unknown;
