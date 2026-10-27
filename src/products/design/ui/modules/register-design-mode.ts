import { registerEditorMode } from "@canvas-ui";
import { designCanvas } from "@design";
import type { ModuleHost } from "@shared/core";
import { designEditor } from "./design-editor-points";
import type { DesignModeDefinition } from "./design-mode.types";

/** A design mode written as one object (it's returned as is; the type checks it). */
export function defineDesignMode(mode: DesignModeDefinition): DesignModeDefinition {
  return mode;
}

/**
 * Registers a design mode: everything `registerEditorMode` does, its rail tabs (shown only while
 * it's on) and its panels (the sidebar, kept sections and kept tabs, `modePanels`).
 */
export function registerDesignMode(host: ModuleHost, mode: DesignModeDefinition): void {
  registerEditorMode(host, { canvas: designCanvas, editor: designEditor }, mode);
  const tabs = mode.rail?.tabs ?? [];
  host.contribute(
    designEditor.leftTabs,
    ...tabs.map((tab, index) => ({
      ...tab,
      order: tab.order ?? (index + 1) * 10,
      modes: [mode.id],
    })),
  );
  const sidebar = mode.sidebar;
  const keepTabs = mode.rail?.keep;
  if (!sidebar && !keepTabs) return;
  host.contribute(designEditor.modePanels, {
    mode: mode.id,
    ...(sidebar
      ? "component" in sidebar
        ? { sidebar: sidebar.component, keepSections: sidebar.keepSections }
        : { sidebar }
      : {}),
    ...(keepTabs ? { keepTabs } : {}),
  });
}
