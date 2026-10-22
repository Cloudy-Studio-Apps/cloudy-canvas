import {
  ClipboardPaste,
  Copy,
  Download,
  Hand,
  House,
  MousePointer2,
  Redo2,
  Save,
  Settings,
  Undo2,
} from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { allKinds, someNodes } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas } from "../../design-points";
import {
  createNodesTool,
  designExportTools,
  designFileTools,
  designInfoTools,
  designReadTools,
  designViewTools,
  nodeArrangeTools,
  nodeEditTools,
} from "./agent";
import { treeOrderKeys } from "./tree/order-keys";
import { treeClips } from "./tree/tree-clips";
import { prepareTreeCopies } from "./tree/prepare-tree-copies";
import { reparentMoved } from "./tree/reparent";
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

/**
 * What every design has whatever its modules: the canvas view (plain, pixel grid, 2%–25600%, size
 * label), the layer tree's hooks (drawing order, clipping, members, dropping into frames, copies),
 * the select and hand buttons, the properties panel's shared sections, the main menu and the agent tools that work on
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
    });
    host.contribute(designCanvas.drawOrder, treeOrderKeys);
    host.contribute(designCanvas.clips, treeClips);
    host.contribute(designCanvas.withMembers, (ids, elements) => withDescendants(ids, elements));
    host.contribute(designCanvas.onMoved, reparentMoved);
    host.contribute(designCanvas.prepareCopies, prepareTreeCopies);

    host.contribute(
      designAgentTools,
      { id: "read", tools: () => designReadTools },
      { id: "info", tools: () => designInfoTools },
      { id: "nodes", tools: (context) => [createNodesTool(context), ...nodeEditTools] },
      { id: "arrange", tools: () => nodeArrangeTools },
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
        toolbar: { group: 0, order: 10 },
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
          { command: "selectAll" },
        ],
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
        ],
      },
      {
        id: "app",
        order: 90,
        items: [
          { label: "Settings", icon: Settings, run: ({ navigate }) => navigate("/settings") },
        ],
      },
    );
  },
});
