import type { ComponentType } from "react";

import type { FileTab, FileTabs } from "@canvas";
import type { FileType } from "@shared/core";

/** The editor a product shows in a tab; it reads the tab with `useTab()`. */
export type TabEditor = ComponentType<{ tabId: string }>;

export interface TabHostProps {
  /** Each product's editor. */
  editors: Record<FileType, TabEditor>;
}

export interface TabEditorSlotProps {
  tabs: FileTabs;
  tab: FileTab;
  /** On screen; the others stay mounted but hidden. */
  active: boolean;
  Editor: TabEditor;
}
