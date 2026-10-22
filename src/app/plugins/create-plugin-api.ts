import * as React from "react";

import {
  asUndoStep,
  BoxKind,
  buildElement,
  createElementBase,
  defineService,
  ELEMENT_DEFAULTS,
  ElementKind,
  LineKind,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  optionalRecord,
  optionalString,
  recordList,
  selectAndEdit,
  stringArg,
  stringList,
  summarizeElement,
  TextBoxKind,
} from "@canvas";
import {
  ColorPalette,
  ColorSwatch,
  ExtensionIconView,
  FloatingPanel,
  OptionButton,
  PanelDivider,
  ToolButton,
  useEngine,
  useEngineElement,
  useEngineState,
  useService,
} from "@canvas-ui";
import {
  boardAgentTools,
  boardCanvas,
  INK_COLOR,
  LINE_COLORS,
  requireBoard,
  SHAPE_FILLS,
  SHAPE_STROKES,
  STICKY_COLORS,
} from "@board";
import { boardEditor } from "@board/ui";
import { boardLibrary, toolItem } from "@board/ui/components/library";
import { pluginStorage } from "@platform";
import {
  createId,
  defineModule,
  definePoint,
  PLUGIN_API_VERSION,
  type InstalledPlugin,
} from "@shared/core";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { PluginApi } from "./plugin-api.types";

/** The API handed to one plugin's `activate`. */
export function createPluginApi(plugin: InstalledPlugin): PluginApi {
  return {
    apiVersion: PLUGIN_API_VERSION,
    plugin: {
      id: plugin.manifest.id,
      manifest: plugin.manifest,
      readAsset: (path) => pluginStorage.readAsset(plugin, path),
      readText: async (path) =>
        new TextDecoder().decode(await pluginStorage.readAsset(plugin, path)),
    },
    core: { defineModule, definePoint, createId },
    canvas: {
      ElementKind,
      BoxKind,
      TextBoxKind,
      LineKind,
      ELEMENT_DEFAULTS,
      createElementBase,
      defineService,
      selectAndEdit,
      asUndoStep,
      buildElement,
      summarizeElement,
      stringArg,
      optionalString,
      optionalNumber,
      optionalBoolean,
      optionalChoice,
      stringList,
      optionalRecord,
      recordList,
    },
    ui: {
      React,
      toast,
      notifyError,
      FloatingPanel,
      PanelDivider,
      ToolButton,
      OptionButton,
      ColorSwatch,
      ColorPalette,
      ExtensionIconView,
      useEngine,
      useEngineState,
      useService,
      useEngineElement,
    },
    board: {
      canvas: boardCanvas,
      editor: boardEditor,
      agentTools: boardAgentTools,
      library: boardLibrary,
      toolItem,
      requireBoard,
      palette: { STICKY_COLORS, SHAPE_FILLS, SHAPE_STROKES, LINE_COLORS, INK_COLOR },
    },
  };
}
