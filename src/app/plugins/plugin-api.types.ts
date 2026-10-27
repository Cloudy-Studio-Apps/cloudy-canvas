import type * as React from "react";

import type * as canvas from "@canvas";
import type * as canvasUi from "@canvas-ui";
import type * as board from "@board";
import type {
  createId,
  defineMessages,
  defineModule,
  definePoint,
  getLocale,
  PluginManifest,
} from "@shared/core";
import type { notifyError, toast } from "@shared/stores/toast-store";
import type { boardLibrary } from "@board/modules/library/ui";
import type { boardEditor } from "@board/ui";
import type * as boardModules from "@board/ui/modules";
import type * as canvasApi from "@canvas";
import type * as design from "@design";
import type * as effectsUi from "@design/modules/effects/ui";
import type { designEditor } from "@design/ui";
import type * as designModules from "@design/ui/modules";
import type * as designPanel from "@design/ui/components/panel";
import type * as designHooks from "@design/ui/hooks";
import type { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import type * as kit from "@shared/ui/kit";
import type { PluginStickersApi } from "./plugin-stickers.types";
import type { PluginThemesApi } from "./plugin-themes.types";

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
    /** A translator over the plugin's own strings (`docs/plugins.md#translations`). */
    defineMessages: typeof defineMessages;
    /** The app's locale (`"en"`, `"es"`), e.g. for `Intl` formatters. */
    getLocale: typeof getLocale;
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
    | "clamp"
    | "mod"
    | "roundPoint"
    | "fitInView"
    | "elementBounds"
    | "rotatePoint"
    | "scaleRect"
    | "scaleLength"
    | "toUnrotated"
    | "gradientCss"
    | "gradientHandles"
    | "transformFromHandles"
    | "pastThreshold"
    | "DRAW_THRESHOLD_PX"
    | "MOVE_THRESHOLD_PX"
    | "FreehandTool"
    | "smoothPoints"
    | "measureTextBlock"
    | "textFont"
    | "fontFamilyList"
  >;
  ui: {
    React: typeof React;
    toast: typeof toast;
    notifyError: typeof notifyError;
    /**
     * The app's UI kit (`IconButton`, `SegmentedControl`, `Field`, `Section`, `ListRow`,
     * `SelectableCard`, `AppDialog`, …, plus the shadcn primitives and `cn`). Built on the theme's
     * tokens, so a plugin's UI follows the theme by itself.
     */
    kit: typeof kit;
  } & Pick<
    typeof canvasUi,
    | "FloatingPanel"
    | "PanelDivider"
    | "ToolButton"
    | "OptionButton"
    | "ColorSwatch"
    | "ColorPalette"
    | "ColorField"
    | "ColorPopover"
    | "chooseImageAsset"
    | "ImageChooseButton"
    | "ModeToolbar"
    | "ModeToolbarItem"
    | "ElementThumbnail"
    | "useElementThumbnail"
    | "AnchorPicker"
    | "ExtensionIconView"
    | "useEngine"
    | "useEngineState"
    | "useService"
    | "useEngineElement"
  >;
  board: {
    /** The board's canvas points (kinds, tools, options, hooks, …). */
    canvas: typeof board.boardCanvas;
    /** The board editor's points (tools, panels, top bar, overlays, …). */
    editor: typeof boardEditor;
    mcpTools: typeof board.boardMcpTools;
    library: typeof boardLibrary;
    /** The standards ER diagrams can follow; contribute ones written with `defineErStandard`. */
    erStandards: typeof board.boardErStandards;
    defineErStandard: typeof board.defineErStandard;
    /** What standards may forbid; contribute ones written with `defineErConstruct`. */
    erConstructs: typeof board.boardErConstructs;
    defineErConstruct: typeof board.defineErConstruct;
    requireBoard: typeof board.requireBoard;
    /** A board mode in one object (`defineBoardMode`), registered with `registerMode(host, mode)`. */
    defineMode: typeof boardModules.defineBoardMode;
    registerMode: typeof boardModules.registerBoardMode;
    palette: Pick<
      typeof board,
      "STICKY_COLORS" | "SHAPE_FILLS" | "SHAPE_STROKES" | "LINE_COLORS" | "INK_COLOR"
    >;
  };
  design: DesignPluginApi;
  /**
   * Stickers for both products' pickers and agents, whatever the plugin's `products`: groups
   * (`registerGroup`) and stickers added to them or to the built-in ones (`registerSet`).
   */
  stickers: PluginStickersApi;
  /** Themes for Settings › Appearance (`register`), and the active theme. */
  themes: PluginThemesApi;
}

/** What `createPluginApi` hands out of the plugin's stages. */
export interface PluginStaged {
  stickers: PluginStickersApi;
  themes: PluginThemesApi;
}

/** What design plugins build on (`api.design`). */
export interface DesignPluginApi {
  /** The design's canvas points (kinds, tools, options, view, hooks, …). */
  canvas: typeof design.designCanvas;
  /**
   * The design editor's points: the shared ones (tools, toolPanels, overlays, …) plus
   * `leftTabs`, `propertySections` and `mainMenu`.
   */
  editor: typeof designEditor;
  /**
   * A design mode in one object (`defineDesignMode`: canvas behavior, toolbar, rail tabs, sidebar,
   * overlays, commands, enter/leave), registered with `registerMode(host, mode)`.
   */
  defineMode: typeof designModules.defineDesignMode;
  registerMode: typeof designModules.registerDesignMode;
  migrations: typeof design.designMigrations;
  /** Agent tools on the open design, one group per module (`requireDesign` gets the design). */
  mcpTools: typeof design.designMcpTools;
  requireDesign: typeof design.requireDesign;
  /** The layer tree service (`useService(DESIGN_TREE)`). */
  tree: typeof design.DESIGN_TREE;
  /** The pages service (`useService(DESIGN_PAGES)`); the page on screen is `engine.scope`. */
  pages: typeof design.DESIGN_PAGES;
  /** The node base every design element extends, and its helpers. */
  nodes: Pick<
    typeof design,
    | "DesignNodeKind"
    | "createNodeBase"
    | "isDesignNode"
    | "solidPaint"
    | "imagePaint"
    | "gradientPaint"
    | "isGradientPaint"
    | "drawPaints"
    | "traceBox"
    | "NODE_DEFAULTS"
    | "BoxShapeKind"
    | "PointsShapeKind"
    | "NodeDrawTool"
    | "BoxDrawTool"
    | "containerAt"
    | "parentFor"
    | "layerNameOf"
    | "pointsInBox"
    | "pointInPolygon"
    | "distanceToOutline"
  >;
  /**
   * Vector networks (vertices, bezier segments, filled regions): building them (from shapes too),
   * placing, hit testing, tracing, editing, and the edit mode's base tool and session.
   */
  network: Pick<
    typeof design,
    | "polylineNetwork"
    | "polygonNetwork"
    | "rectNetwork"
    | "ellipseNetwork"
    | "placeNetwork"
    | "scaleNetwork"
    | "networkBounds"
    | "hitSegment"
    | "vertexAt"
    | "insideRegion"
    | "traceStrokes"
    | "traceRegions"
    | "splitSegment"
    | "connect"
    | "addVertex"
    | "moveVertices"
    | "setTangent"
    | "removeParts"
    | "cutSegment"
    | "bendSegment"
    | "toggleSmooth"
    | "toggleRegion"
    | "networkFaces"
    | "faceAt"
    | "VectorEditTool"
    | "VECTOR_EDIT"
    | "VECTOR_TOOLS"
  >;
  /** Building blocks of the side panels, for tabs and property sections. */
  panel: Pick<
    typeof designPanel,
    | "PanelSection"
    | "PanelIconButton"
    | "PanelAddButton"
    | "NumberField"
    | "NodeNumberField"
    | "NodeSelectField"
    | "NodeCheckbox"
    | "NodeOptionButtons"
    | "FieldBox"
    | "HexInput"
    | "PercentInput"
    | "PaintField"
    | "PropertyGrid"
    | "sharedValue"
  >;
  /** Filters for `propertySections` entries' `when`. */
  sections: Pick<typeof designModules, "ofType" | "allKinds" | "someNodes" | "noNodes">;
  /**
   * Effects of a plugin's own: a renderer on `canvas.effectRenderers` (drawn on the GPU with
   * these shaders and helpers), an entry on `effectTypes` (`defineEffectType`, with these
   * fields) and how agents give it (`setEffectReader`).
   */
  effects: { effectTypes: typeof effectsUi.designEffectTypes } & Pick<
    typeof effectsUi,
    "defineEffectType"
  > &
    Pick<
      typeof design,
      "setEffectReader" | "localUniforms" | "LOCAL_GLSL" | "LOCAL_UNIFORMS" | "NOISE_GLSL"
    > &
    Pick<
      typeof canvasApi,
      | "EffectShader"
      | "FILTER_HEADER"
      | "SAMPLING_GLSL"
      | "silhouetteShader"
      | "underShader"
      | "atopShader"
      | "shapeUnderShader"
    > &
    Pick<typeof effectsUi, "EffectChoice" | "ScrubField">;
  hooks: Pick<typeof designHooks, "useSelectedNodes" | "useEditNodes" | "useMoveNodes"> & {
    useDesignEngine: typeof useDesignEngine;
    useDesignState: typeof useDesignState;
  };
}

/** A plugin's code: its default export. */
export type PluginActivate = (api: PluginApi) => unknown;
