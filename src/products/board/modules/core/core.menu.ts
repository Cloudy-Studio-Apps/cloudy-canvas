import { ClipboardPaste, Copy, Download, Info, Redo2, Save, Settings, Undo2 } from "lucide-react";

import { openAbout } from "@shared/about";
import type { ModuleHost } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { t } from "./core.i18n";

/**
 * The main menu's groups (the title bar's seal on a board): File, Edit, View, then Settings and
 * About. Only commands every board has; modules add their own groups or items.
 */
export function registerCoreMenu(host: ModuleHost): void {
  host.contribute(
    boardEditor.mainMenu,
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
        { command: "cut" },
        { command: "copy", icon: Copy },
        { command: "paste", icon: ClipboardPaste },
        { command: "duplicate" },
        { command: "selectAll" },
      ],
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
        { command: "toggleUi", label: t("hideUi") },
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
