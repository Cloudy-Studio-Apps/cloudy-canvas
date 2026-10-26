import { Hand, MousePointer2, Scaling } from "lucide-react";

import { useHideUiCommand } from "@canvas-ui";
import type { ModuleHost } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { allKinds, someNodes } from "@design/ui/modules/section-filters";
import { TRANSFORM_ITEMS } from "./core.menu";
import { GradientHandles } from "./ui/gradient-handles";
import { ScaleSidebar } from "./ui/scale-sidebar";
import {
  AppearanceSection,
  ExportSection,
  FillSection,
  LayoutSection,
  PositionSection,
  PrototypeSection,
  StrokeSection,
} from "./ui/sections";
import { useFlipCommands } from "./ui/use-flip-commands";
import { usePanelCommands } from "./ui/use-panel-commands";
import { useStartMode } from "./ui/use-start-mode";
import { useViewCommands } from "./ui/use-view-commands";

/**
 * The move, scale and hand buttons, the properties panel's shared sections, the scale sidebar, the
 * gradient handles, the commands' session hooks and the Transform context menu.
 */
export function registerCoreSections(host: ModuleHost): void {
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
  host.contribute(designEditor.contextMenu, {
    id: "transform",
    menu: "selection",
    label: "Transform",
    items: TRANSFORM_ITEMS,
  });
}
