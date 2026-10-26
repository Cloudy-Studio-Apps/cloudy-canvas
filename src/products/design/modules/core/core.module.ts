import {
  ClipboardPaste,
  Copy,
  Download,
  Hand,
  House,
  Info,
  MousePointer2,
  Palette,
  PenLine,
  PenTool,
  Redo2,
  Save,
  Scaling,
  Settings,
  Undo2,
} from "lucide-react";

import { DEFAULT_MODE } from "@canvas";
import { useHideUiCommand } from "@canvas-ui";
import { openAbout } from "@shared/about";
import { defineModule } from "@shared/core";
import { themeChoices } from "@shared/ui/theme";
import { designStyleTypes } from "./ui/core.points";
import { createNodeStyle } from "./ui/styles";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { useDesignPanelStore } from "@design/ui/stores/design-panel-store";
import { allKinds, someNodes } from "@design/ui/modules/section-filters";
import { designMcpTools, designCanvas, designSelectRedirects } from "../../design-points";
import {
  createNodesTool,
  designExportTools,
  designFileTools,
  designInfoTools,
  designReadTools,
  designViewTools,
  nodeArrangeTools,
  nodeTransformTools,
  nodeEditTools,
} from "./mcp";
import { pasteGradientOnto } from "./node/paste-gradient";
import { treeOrderKeys } from "./tree/order-keys";
import { hostSelectTarget } from "./tree/host-select-target";
import { resolveTree } from "./tree/resolve-tree";
import { treeClips } from "./tree/tree-clips";
import { treeUndrawn } from "./tree/tree-undrawn";
import { prepareTreeCopies } from "./tree/prepare-tree-copies";
import { reparentMoved } from "./tree/reparent";
import { containerAlignTarget } from "./tree/align-target";
import { selectionRulerFrame } from "./tree/ruler-frame";
import { topFrames } from "./tree/top-frames";
import { useFlipCommands } from "./ui/use-flip-commands";
import { usePanelCommands } from "./ui/use-panel-commands";
import { useStartMode } from "./ui/use-start-mode";
import { useViewCommands } from "./ui/use-view-commands";
import { GradientHandles } from "./ui/gradient-handles";
import {
  PaintStyleEditor,
  PaintStylePreview,
  StrokeStyleEditor,
  StrokeStylePreview,
} from "./ui/styles";
import {
  PAINT_STYLE,
  paintBindingsOf,
  paintStyleOfNode,
  paintStyleSummary,
  STROKE_STYLE,
  strokeBindingsOf,
  strokeStyleOfNode,
  strokeStyleSummary,
} from "./styles";
import { ScaleSidebar } from "./ui/scale-sidebar";
import { withDescendants } from "./tree/tree-members";
import {
  AppearanceSection,
  ExportSection,
  FillSection,
  LayoutSection,
  PositionSection,
  PrototypeSection,
  StrokeSection,
} from "./ui/sections";

/** Turning and mirroring the selection, in the main menu and the context menu. */
const TRANSFORM_ITEMS = [
  { command: "rotateLeft", label: "Rotate 90° left" },
  { command: "rotateRight", label: "Rotate 90° right" },
  { command: "flipHorizontal", label: "Flip horizontal" },
  { command: "flipVertical", label: "Flip vertical" },
];

/**
 * What every design has whatever its modules: the canvas view (plain, pixel grid, 2%–25600%, size
 * label, snapping), the layer tree's hooks (drawing order, clipping, members, dropping into frames, copies),
 * the move, scale (K) and hand buttons, the properties panel's shared sections, the main menu and the agent tools that work on
 * any layer (reading, creating and editing through the kinds, arranging, viewing, exporting, files).
 */
export const coreModule = defineModule({
  id: "core",
  register(host) {
    host.contribute(designCanvas.view, {
      minZoom: 0.02,
      maxZoom: 256,
      grid: "pixels",
      sizeLabel: true,
      snapping: { objects: true, pixelGrid: true, guides: true },
      rulers: true,
    });
    host.contribute(designCanvas.drawOrder, treeOrderKeys);
    host.contribute(designCanvas.clips, treeClips);
    host.contribute(designCanvas.resolveElements, resolveTree);
    host.contribute(designCanvas.undrawn, treeUndrawn);
    // Read when a click happens: every module has contributed by then.
    host.contribute(designCanvas.selectTarget, (hitId, request, elements, kinds) =>
      hostSelectTarget(hitId, request, elements, kinds, host.get(designSelectRedirects)),
    );
    host.contribute(designCanvas.withMembers, (ids, elements) => withDescendants(ids, elements));
    host.contribute(designCanvas.onMoved, reparentMoved);
    host.contribute(designCanvas.alignTarget, containerAlignTarget);
    host.contribute(designCanvas.pasteOnto, pasteGradientOnto);
    host.contribute(designCanvas.rulerFrame, selectionRulerFrame);
    host.contribute(designCanvas.frames, topFrames);
    host.contribute(
      designCanvas.hostCommands,
      { id: "flipHorizontal", label: "Flip horizontal", keys: [{ key: "h", shift: true }] },
      { id: "flipVertical", label: "Flip vertical", keys: [{ key: "v", shift: true }] },
      { id: "toggleRulers", label: "Rulers", keys: [{ key: "r", shift: true }] },
      {
        id: "toggleGuides",
        label: "Ruler guides",
        keys: [{ code: "Semicolon", shift: true, label: ";" }],
      },
      { id: "clearGuides", label: "Remove all guides" },
      { id: "toggleUi", label: "Hide UI", keys: [{ code: "Backslash", mod: true, label: "\\" }] },
      { id: "toggleLeftPanel", label: "Left panel" },
      { id: "toggleRightPanel", label: "Properties panel" },
    );
    host.contribute(designCanvas.prepareCopies, prepareTreeCopies);
    host.contribute(designCanvas.keybindings, { "tool.scale": [{ key: "k" }] });

    host.contribute(
      designMcpTools,
      { id: "read", tools: () => designReadTools },
      { id: "info", tools: () => designInfoTools },
      { id: "nodes", tools: (context) => [createNodesTool(context), ...nodeEditTools] },
      { id: "arrange", tools: () => [...nodeArrangeTools, ...nodeTransformTools] },
      { id: "view", tools: () => designViewTools },
      { id: "export", tools: () => designExportTools },
      { id: "files", tools: () => designFileTools },
    );

    host.contribute(
      designEditor.tools,
      {
        tool: "select",
        label: "Move",
        description: "Select, move and resize layers.",
        icon: MousePointer2,
        toolbar: { group: 0, order: 10, menu: "move" },
      },
      {
        tool: "scale",
        label: "Scale",
        description: "Scale layers with their content: text, strokes, corners and children.",
        icon: Scaling,
        toolbar: { group: 0, order: 15, menu: "move" },
      },
      {
        tool: "hand",
        label: "Hand",
        description: "Pan around the canvas.",
        icon: Hand,
        toolbar: { group: 0, order: 20 },
      },
    );

    host.contribute(
      designEditor.propertySections,
      { id: "position", tab: "design", order: 20, when: someNodes, component: PositionSection },
      {
        id: "layout",
        tab: "design",
        order: 30,
        when: allKinds((kind) => kind.resizable),
        component: LayoutSection,
      },
      { id: "appearance", tab: "design", order: 40, when: someNodes, component: AppearanceSection },
      {
        id: "fills",
        tab: "design",
        order: 60,
        when: allKinds((kind) => kind.fillable),
        component: FillSection,
      },
      {
        id: "strokes",
        tab: "design",
        order: 70,
        when: allKinds((kind) => kind.strokable),
        component: StrokeSection,
      },
      { id: "export", tab: "design", order: 90, when: () => true, component: ExportSection },
      {
        id: "prototype",
        tab: "prototype",
        order: 10,
        when: () => true,
        component: PrototypeSection,
      },
    );

    // Color and stroke styles (text styles are the text module's, effect styles the effects').
    host.contribute(
      designStyleTypes,
      {
        id: PAINT_STYLE,
        label: "Color",
        heading: "Color styles",
        icon: Palette,
        order: 20,
        create: (engine) =>
          createNodeStyle(
            engine,
            PAINT_STYLE,
            (node) => paintStyleOfNode(node, "fills"),
            (node) => paintBindingsOf(node, "fills"),
          ),
        Preview: PaintStylePreview,
        summary: paintStyleSummary,
        Editor: PaintStyleEditor,
      },
      {
        id: STROKE_STYLE,
        label: "Stroke",
        heading: "Stroke styles",
        icon: PenLine,
        order: 40,
        create: (engine) =>
          createNodeStyle(engine, STROKE_STYLE, strokeStyleOfNode, strokeBindingsOf),
        Preview: StrokeStylePreview,
        summary: strokeStyleSummary,
        Editor: StrokeStyleEditor,
      },
    );
    host.contribute(designEditor.toolSidebars, { tool: "scale", component: ScaleSidebar });
    host.contribute(designEditor.overlays, {
      id: "core.gradient-handles",
      component: GradientHandles,
    });
    host.contribute(
      designEditor.sessionHooks,
      { id: "flip-commands", use: useFlipCommands },
      { id: "view-commands", use: useViewCommands },
      { id: "panel-commands", use: usePanelCommands },
      { id: "hide-ui", use: useHideUiCommand },
      { id: "start-mode", use: useStartMode },
    );
    // The design's usual way of working, first in the mode switcher (shown once a module adds a
    // mode, e.g. Catalog).
    host.contribute(designEditor.modes, {
      id: DEFAULT_MODE.id,
      label: "Design",
      description: "Every tool and every layer.",
      icon: PenTool,
      order: 0,
    });
    host.contribute(designEditor.contextMenu, {
      id: "transform",
      menu: "selection",
      label: "Transform",
      items: TRANSFORM_ITEMS,
    });
    host.contribute(
      designEditor.mainMenu,
      {
        id: "home",
        order: 10,
        items: [{ label: "Back to home", icon: House, run: ({ navigate }) => navigate("/") }],
      },
      {
        id: "file",
        order: 20,
        label: "File",
        items: [
          { command: "save", icon: Save },
          { command: "saveAs" },
          { command: "export", icon: Download },
        ],
      },
      {
        id: "edit",
        order: 30,
        label: "Edit",
        items: [
          { command: "undo", icon: Undo2 },
          { command: "redo", icon: Redo2 },
          { command: "copy", icon: Copy },
          { command: "paste", icon: ClipboardPaste },
          { command: "duplicate" },
          { command: "copyProperties" },
          { command: "pasteProperties" },
          { command: "selectAll" },
        ],
      },
      {
        id: "transform",
        order: 36,
        label: "Transform",
        items: TRANSFORM_ITEMS,
      },
      {
        id: "view",
        order: 40,
        label: "View",
        items: [
          { command: "zoomIn" },
          { command: "zoomOut" },
          { command: "zoomReset" },
          { command: "zoomToFit" },
          { command: "zoomToSelection" },
          { command: "previousFrame" },
          { command: "nextFrame" },
        ],
      },
      {
        id: "show",
        order: 41,
        items: [
          {
            command: "toggleRulers",
            label: "Rulers",
            checked: (engine) => engine.getState().rulersShown,
          },
          {
            command: "toggleGuides",
            label: "Ruler guides",
            checked: (engine) => engine.getState().guidesShown,
          },
          { command: "clearGuides", label: "Remove all guides" },
          {
            command: "toggleLeftPanel",
            label: "Left panel",
            checked: () => useDesignPanelStore.getState().leftOpen,
          },
          {
            command: "toggleRightPanel",
            label: "Properties panel",
            checked: () => useDesignPanelStore.getState().rightOpen,
          },
          { command: "toggleUi", label: "Hide UI" },
        ],
      },
      {
        id: "theme",
        order: 42,
        label: "Theme",
        items: [
          ...themeChoices().map((choice) => ({
            label: choice.label,
            checked: choice.active,
            run: choice.select,
          })),
          {
            label: "Appearance settings…",
            run: ({ navigate }) => navigate("/settings/appearance"),
          },
        ],
      },
      {
        id: "app",
        order: 90,
        items: [
          { label: "Settings", icon: Settings, run: ({ navigate }) => navigate("/settings") },
          { label: "About Cloudy Canvas", icon: Info, run: openAbout },
        ],
      },
    );
  },
});
