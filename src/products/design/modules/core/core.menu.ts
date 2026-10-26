import {
  ClipboardPaste,
  Copy,
  Download,
  House,
  Info,
  Redo2,
  Save,
  Settings,
  Undo2,
} from "lucide-react";

import { openAbout } from "@shared/about";
import type { ModuleHost } from "@shared/core";
import { themeChoices } from "@shared/ui/theme";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { useDesignPanelStore } from "@design/ui/stores/design-panel-store";

/** Turning and mirroring the selection, in the main menu and the context menu. */
export const TRANSFORM_ITEMS = [
  { command: "rotateLeft", label: "Rotate 90° left" },
  { command: "rotateRight", label: "Rotate 90° right" },
  { command: "flipHorizontal", label: "Flip horizontal" },
  { command: "flipVertical", label: "Flip vertical" },
];

/**
 * The main menu's groups: home, File, Edit, Transform, View, what's shown, Theme, Settings and
 * About.
 */
export function registerCoreMenu(host: ModuleHost): void {
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
}
