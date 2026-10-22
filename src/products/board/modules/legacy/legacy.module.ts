import {
  Frame,
  Hand,
  MousePointer2,
  Network,
  PenLine,
  Shapes,
  Spline,
  Sticker,
  Table,
  Type,
} from "lucide-react";

import { defineModule } from "@shared/core";
import {
  BUILT_IN_ITEMS,
  BUILT_IN_SECTIONS,
  toolItem,
} from "@board/ui/components/library/library-catalog";
import { OPEN_LIBRARY } from "@board/ui/components/library/library-command";
import { boardLibrary } from "@board/ui/components/library/library-points";
import { ErPanel } from "@board/ui/components/er-panel";
import { SectionsMenu } from "@board/ui/components/sections-menu";
import { StickerWheel } from "@board/ui/components/sticker-picker";
import { ConnectorOptions } from "@board/ui/components/tool-options/connector-options";
import { DrawOptions } from "@board/ui/components/tool-options/draw-options";
import { ImageOptions } from "@board/ui/components/tool-options/image-options";
import { SectionOptions } from "@board/ui/components/tool-options/section-options";
import { ShapeOptions } from "@board/ui/components/tool-options/shape-options";
import { TableOptions } from "@board/ui/components/tool-options/table-options";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import {
  arrangeTools,
  boardInfoTools,
  boardReadTools,
  createShapesTool,
  erTools,
  exportTools,
  fileTools,
  shapeEditTools,
  stickerTools,
  viewTools,
} from "../../agent";
import { boardAgentTools, boardCanvas } from "../../board-points";
import {
  ConnectorKind,
  createPastedImage,
  createPastedText,
  detachConnectors,
  ErAggregateKind,
  ErAttributeKind,
  ErConstraintKind,
  ErEntityKind,
  ErIsaKind,
  ErLinks,
  ErRelationKind,
  GeoKind,
  IMAGE_DEFAULTS,
  ImageKind,
  prepareConnectorCopies,
  prepareErCopies,
  pruneEr,
  resolveConnectors,
  resolveErElements,
  SectionKind,
  STROKE_DEFAULTS,
  StickerKind,
  StrokeKind,
  TableKind,
  TextKind,
  withErMembers,
  withSectionMembers,
} from "../../elements";
import {
  HIGHLIGHTER_COLORS,
  HIGHLIGHTER_SIZES,
  LINE_COLORS,
  MARKER_COLORS,
  MARKER_SIZES,
  SECTION_COLORS,
  SHAPE_FILLS,
  SHAPE_STROKES,
  TABLE_COLORS,
} from "../../palette";
import {
  ConnectorTool,
  EraserTool,
  ErTool,
  MarkerTool,
  SectionTool,
  ShapeTool,
  StickerTool,
  TableTool,
  TextTool,
} from "../../tools";

/**
 * Everything of the board that isn't a module of its own yet, wired as it was before modules.
 * Temporary: each feature moves out into its own folder (`modules/<name>/`) when it's next
 * worked on, and this module goes away once it's empty.
 */
export const legacyModule = defineModule({
  id: "legacy",
  // A pasted link is a card before it's text; copies get their schema names before their ER
  // diagrams and loose connector ends.
  after: ["embed", "db"],
  register(host) {
    const sticker = new StickerKind();
    const table = new TableKind();
    const entity = new ErEntityKind();
    host.contribute(
      boardCanvas.kinds,
      new StrokeKind(),
      new TextKind(),
      new GeoKind(),
      new SectionKind(),
      table,
      new ImageKind(),
      sticker,
      new ConnectorKind(),
      entity,
      new ErRelationKind(),
      new ErAttributeKind(),
      new ErIsaKind(),
      new ErAggregateKind(),
      new ErConstraintKind(),
    );
    host.contribute(
      boardCanvas.tools,
      { id: "marker", create: (ctx) => new MarkerTool(ctx), keys: [{ key: "m" }] },
      { id: "eraser", create: (ctx) => new EraserTool(ctx), keys: [{ key: "e", shift: true }] },
      { id: "text", create: (ctx) => new TextTool(ctx), keys: [{ key: "t" }] },
      { id: "shape", create: (ctx) => new ShapeTool(ctx), keys: [{ key: "r" }] },
      { id: "section", create: (ctx) => new SectionTool(ctx), keys: [{ key: "s", shift: true }] },
      { id: "table", create: (ctx) => new TableTool(ctx), keys: [{ key: "g" }] },
      { id: "connector", create: (ctx) => new ConnectorTool(ctx), keys: [{ key: "x" }] },
      { id: "er", create: (ctx) => new ErTool(ctx), keys: [{ key: "e" }] },
      { id: "sticker", create: (ctx) => new StickerTool(ctx), keys: [{ key: "k" }] },
    );
    // The library of widgets, templates and more is a panel in the editor.
    host.contribute(boardCanvas.hostCommands, {
      ...OPEN_LIBRARY,
      keys: [{ key: "i", shift: true }],
    });
    host.contribute(boardCanvas.options, {
      drawPen: STROKE_DEFAULTS.pen,
      drawSmooth: false,
      markerColor: MARKER_COLORS[0].value,
      markerSize: MARKER_SIZES[1].value,
      highlighterColor: HIGHLIGHTER_COLORS[0].value,
      highlighterSize: HIGHLIGHTER_SIZES[1].value,
      shapeKind: "rectangle",
      shapeFill: SHAPE_FILLS[0].value,
      shapeStroke: SHAPE_STROKES[0].value,
      sectionColor: SECTION_COLORS[0].value,
      connectorStyle: "elbow",
      connectorColor: LINE_COLORS[0].value,
      connectorStartHead: "none",
      connectorEndHead: "arrow",
      imageBackground: IMAGE_DEFAULTS.background,
      imagePadding: IMAGE_DEFAULTS.padding,
      tableColor: TABLE_COLORS[0].value,
      tableHeader: true,
      sticker: null,
    });
    host.contribute(boardCanvas.links, () => new ErLinks());
    // Aggregation boxes and constraints follow the ER elements they're about, and connectors
    // follow whatever they're attached to (ER boxes included, so they're resolved last).
    host.contribute(boardCanvas.resolveElements, (elements, kinds) =>
      resolveConnectors(resolveErElements(elements), kinds),
    );
    // A section takes everything inside it; an ER element takes its attributes along, and
    // dragging an aggregation box takes what it holds.
    host.contribute(boardCanvas.withMembers, (ids, elements, purpose, kinds) =>
      withErMembers(withSectionMembers(ids, elements, kinds), elements, purpose === "move"),
    );
    // Connectors attached to deleted elements keep a free end where they were, and ER elements
    // that belonged to deleted ones go with them.
    host.contribute(boardCanvas.onRemove, (doc, removed, before) => {
      detachConnectors(doc, removed, before);
      pruneEr(doc);
    });
    // Copies get their own ER diagrams, and connector ends attached to elements that weren't
    // copied come loose.
    host.contribute(boardCanvas.prepareCopies, (copies, context) =>
      prepareConnectorCopies(prepareErCopies(copies, context), context),
    );
    host.contribute(boardCanvas.pasteText, (text, at, index) => createPastedText(text, at, index));
    host.contribute(boardCanvas.pasteImage, (image, view, index) =>
      createPastedImage(image, view, index),
    );
    host.contribute(
      boardAgentTools,
      { id: "read", tools: () => boardReadTools },
      { id: "info", tools: () => boardInfoTools },
      { id: "shapes", tools: (context) => [createShapesTool(context), ...shapeEditTools] },
      { id: "arrange", tools: () => arrangeTools },
      { id: "stickers", tools: () => stickerTools },
      { id: "er", tools: () => erTools },
      { id: "view", tools: () => viewTools },
      { id: "export", tools: () => exportTools },
      { id: "files", tools: () => fileTools },
    );

    host.contribute(
      boardEditor.toolbar,
      {
        tool: "select",
        label: "Select",
        description: "Select, move and resize. Double-click to edit text.",
        icon: MousePointer2,
        group: 0,
        order: 10,
      },
      {
        tool: "hand",
        label: "Hand",
        description: "Pan around the board.",
        icon: Hand,
        group: 0,
        order: 20,
      },
      {
        tool: "marker",
        element: "stroke",
        icon: PenLine,
        group: 1,
        order: 10,
        subTools: [{ id: "eraser", label: "Eraser" }],
      },
      { tool: "sticker", element: "sticker", icon: Sticker, group: 1, order: 30 },
      { tool: "text", element: "text", icon: Type, group: 1, order: 40 },
      { tool: "shape", element: "geo", icon: Shapes, group: 1, order: 50 },
      { tool: "connector", element: "connector", icon: Spline, group: 1, order: 60 },
      { tool: "section", element: "section", icon: Frame, group: 1, order: 70 },
      { tool: "table", element: "table", icon: Table, group: 1, order: 80 },
      { tool: "er", element: "er-entity", icon: Network, group: 1, order: 100 },
    );
    host.contribute(
      boardEditor.toolPanels,
      { tool: "marker", component: DrawOptions },
      { tool: "eraser", component: DrawOptions },
      { tool: "shape", component: ShapeOptions },
      { tool: "section", component: SectionOptions },
      { tool: "table", component: TableOptions },
      { tool: "connector", component: ConnectorOptions },
      { tool: "sticker", component: StickerWheel },
    );
    host.contribute(
      boardEditor.selectionPanels,
      { type: "stroke", component: DrawOptions },
      { type: "geo", component: ShapeOptions },
      { type: "section", component: SectionOptions },
      { type: "table", component: TableOptions },
      { type: "connector", component: ConnectorOptions },
      { type: "image", component: ImageOptions },
    );
    host.contribute(boardEditor.sidePanels, { id: "er.panel", order: 20, component: ErPanel });
    host.contribute(boardEditor.topBar, {
      id: "section.menu",
      order: 10,
      component: SectionsMenu,
    });
    host.contribute(boardLibrary.sections, ...BUILT_IN_SECTIONS);
    host.contribute(
      boardLibrary.items,
      toolItem("sticker", sticker, Sticker, 10),
      toolItem("table", table, Table, 20),
      toolItem("er", entity, Network, 40, ["entity", "relation", "chen"]),
      ...BUILT_IN_ITEMS,
    );
  },
});
