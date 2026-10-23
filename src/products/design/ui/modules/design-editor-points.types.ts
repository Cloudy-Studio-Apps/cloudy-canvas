import type { ComponentType } from "react";

import type { CanvasElement, ElementKinds } from "@canvas";
import type { EditorPoints, ExtensionIcon } from "@canvas-ui";
import type { DesignEngine, DesignNode, DesignToolOptions } from "@design";
import type { ExtensionPoint } from "@shared/core";

/** A tab of the left panel, picked from the rail along the window's left edge. */
export interface LeftTabEntry {
  id: string;
  label: string;
  icon: ExtensionIcon;
  /** Position in the rail, lowest first. Built-ins are spaced by 10 (Layers is 10). */
  order: number;
  component: ComponentType;
}

/** What the properties panel shows sections for: the selected nodes. */
export interface PropertySelection {
  /** The selected design nodes (as the scene has them); empty when nothing is selected. */
  nodes: readonly DesignNode[];
  kinds: ElementKinds<DesignToolOptions>;
  /** Everything on the page on screen, bottom to top (e.g. what masks the selection). */
  elements: readonly CanvasElement[];
}

export interface PropertySectionProps {
  selection: PropertySelection;
}

/**
 * A section of the properties panel (Position, Fill, …). Sections apply by what the selection is
 * or can do (`when`), not by element type, so one section serves every type that has its fields.
 */
export interface PropertySectionEntry {
  id: string;
  tab: "design" | "prototype";
  /** Position in its tab, lowest first. Built-ins are spaced by 10. */
  order: number;
  /** Whether it shows for this selection (an empty selection is the page). */
  when(selection: PropertySelection): boolean;
  component: ComponentType<PropertySectionProps>;
}

/**
 * What the properties panel shows instead of the selection's sections while a tool is on (e.g.
 * the frame tool's presets, as in Figma).
 */
export interface ToolSidebarEntry {
  tool: string;
  component: ComponentType;
}

/**
 * A layer type's icon in the layers panel, for types no tool creates (e.g. groups); the others
 * show their tool's icon.
 */
export interface LayerIconEntry {
  type: string;
  icon: ExtensionIcon;
}

/** What a main menu item can reach when it's picked. */
export interface MainMenuContext {
  engine: DesignEngine;
  /** Goes to an app route, e.g. `"/"` (Home). */
  navigate(to: string): void;
}

/** An item of the main menu: an engine command (named and bound by the keymap) or an action. */
export type MainMenuItem = {
  icon?: ExtensionIcon;
  /** Shows the item as a checkbox, ticked while this is true (e.g. whether the rulers show). */
  checked?: (engine: DesignEngine) => boolean;
} & ({ command: string; label?: string } | { label: string; run(context: MainMenuContext): void });

/** Items of the main menu (the logo's) between separators, with an optional heading. */
export interface MainMenuGroup {
  id: string;
  /** Position in the menu, lowest first. Built-ins are spaced by 10. */
  order: number;
  label?: string;
  items: readonly MainMenuItem[];
}

/** The design editor's points: the shared editor points plus its own panels and menu. */
export interface DesignEditorPoints extends EditorPoints {
  leftTabs: ExtensionPoint<LeftTabEntry>;
  propertySections: ExtensionPoint<PropertySectionEntry>;
  mainMenu: ExtensionPoint<MainMenuGroup>;
  toolSidebars: ExtensionPoint<ToolSidebarEntry>;
  layerIcons: ExtensionPoint<LayerIconEntry>;
}
