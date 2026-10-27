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
import { t } from "./core.i18n";

/** Turning and mirroring the selection, in the main menu and the context menu. */
export const TRANSFORM_ITEMS = [
  { command: "rotateLeft", label: t("commands.rotateLeft") },
  { command: "rotateRight", label: t("commands.rotateRight") },
  { command: "flipHorizontal", label: t("commands.flipHorizontal") },
  { command: "flipVertical", label: t("commands.flipVertical") },
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
      items: [{ label: t("menu.backHome"), icon: House, run: ({ navigate }) => navigate("/") }],
    },
    {
      id: "file",
      order: 20,
      label: t("menu.file"),
      items: [
        { command: "save", icon: Save },
        { command: "saveAs" },
        { command: "export", icon: Download },
      ],
    },
    {
      id: "edit",
      order: 30,
      label: t("menu.edit"),
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
      label: t("menu.transform"),
      items: TRANSFORM_ITEMS,
    },
    {
      id: "view",
      order: 40,
      label: t("menu.view"),
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
          label: t("commands.rulers"),
          checked: (engine) => engine.getState().rulersShown,
        },
        {
          command: "toggleGuides",
          label: t("commands.rulerGuides"),
          checked: (engine) => engine.getState().guidesShown,
        },
        { command: "clearGuides", label: t("commands.removeGuides") },
        {
          command: "toggleLeftPanel",
          label: t("commands.leftPanel"),
          checked: () => useDesignPanelStore.getState().leftOpen,
        },
        {
          command: "toggleRightPanel",
          label: t("commands.propertiesPanel"),
          checked: () => useDesignPanelStore.getState().rightOpen,
        },
        { command: "toggleUi", label: t("commands.hideUi") },
      ],
    },
    {
      id: "theme",
      order: 42,
      label: t("menu.theme"),
      items: [
        ...themeChoices().map((choice) => ({
          label: choice.label,
          checked: choice.active,
          run: choice.select,
        })),
        {
          label: t("menu.appearanceSettings"),
          run: ({ navigate }) => navigate("/settings/appearance"),
        },
      ],
    },
    {
      id: "app",
      order: 90,
      items: [
        { label: t("menu.settings"), icon: Settings, run: ({ navigate }) => navigate("/settings") },
        { label: t("menu.about"), icon: Info, run: openAbout },
      ],
    },
  );
}
