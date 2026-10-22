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
import { designCanvas } from "../../design-points";
import { treeOrderKeys } from "./tree/order-keys";
import { prepareTreeCopies } from "./tree/prepare-tree-copies";
import { reparentMoved } from "./tree/reparent";
import { withDescendants } from "./tree/tree-members";
import {
  AppearanceSection,
  ExportSection,
  FillSection,
  LayoutSection,
  PageSection,
  PositionSection,
  PrototypeSection,
  StrokeSection,
} from "./ui/sections";

/**
 * What every design has whatever its modules: the canvas view (plain, pixel grid, 2%–25600%), the
 * layer tree's hooks (drawing order, members, dropping into frames, copies), the select and hand
 * buttons, the properties panel's shared sections and the main menu.
 */
export const coreModule = defineModule({
  id: "core",
  register(host) {
    host.contribute(designCanvas.view, { minZoom: 0.02, maxZoom: 256, grid: "pixels" });
    host.contribute(designCanvas.drawOrder, treeOrderKeys);
    host.contribute(designCanvas.withMembers, (ids, elements) => withDescendants(ids, elements));
    host.contribute(designCanvas.onMoved, reparentMoved);
    host.contribute(designCanvas.prepareCopies, prepareTreeCopies);

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

    const any = ({ nodes }: { nodes: readonly unknown[] }) => nodes.length > 0;
    host.contribute(
      designEditor.propertySections,
      {
        id: "page",
        tab: "design",
        order: 10,
        when: (s) => s.nodes.length === 0,
        component: PageSection,
      },
      { id: "position", tab: "design", order: 20, when: any, component: PositionSection },
      { id: "layout", tab: "design", order: 30, when: any, component: LayoutSection },
      { id: "appearance", tab: "design", order: 40, when: any, component: AppearanceSection },
      { id: "fills", tab: "design", order: 60, when: any, component: FillSection },
      { id: "strokes", tab: "design", order: 70, when: any, component: StrokeSection },
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
