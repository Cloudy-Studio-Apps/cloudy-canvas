import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { ExtensionPoint, ModuleHost } from "@shared/core";
import type { ContextMenuGroup } from "../components/context-menu/context-menu-items.types";

/** An icon a module shows: a Lucide icon, or an SVG document (drawn at the text's size). */
export type ExtensionIcon = LucideIcon | { svg: string };

/** A tool picked from another tool's options panel, which keeps that tool's button active. */
export interface ToolbarSubTool {
  id: string;
  label: string;
}

/** Where a tool's button sits on the editor's main toolbar. */
export interface ToolbarPlacement {
  /**
   * Buttons are grouped by this number, lowest first, with a divider between groups. The
   * built-ins use 0 (select, hand) and 1 (the tools that add elements).
   */
  group: number;
  /** Position within the group, lowest first. Built-ins are spaced by 10 to leave room. */
  order: number;
  /**
   * Tools with the same `menu` share one button, placed where the first of them goes: it shows
   * the tool picked last (or the active one), and its chevron lists them all (e.g. the shapes).
   */
  menu?: string;
}

/** How a tool is listed in the product's library (the widgets panel). */
export interface LibraryPlacement {
  /** The library section (default: the product's tools section). */
  section?: string;
  /** Position in the section, lowest first (default: its toolbar position). */
  order?: number;
  /** More words the library's search matches. */
  keywords?: readonly string[];
}

/**
 * A tool as the editor shows it: its icon, its name and description, and where it's placed.
 * A tool that creates an element is named by the element's kind (`element`); the others give
 * their own `label` and `description`.
 */
export type ToolEntry = {
  tool: string;
  icon: ExtensionIcon;
  /** Its button on the main toolbar; without one, it isn't on the toolbar. */
  toolbar?: ToolbarPlacement;
  /**
   * Its card in the library. Tools that create an element are listed by default (`false` keeps
   * one out); other tools only with a placement.
   */
  library?: LibraryPlacement | false;
  subTools?: readonly ToolbarSubTool[];
} & ({ element: string } | { label: string; description: string });

/** A tool that's on the toolbar. */
export type PlacedToolEntry = ToolEntry & { toolbar: ToolbarPlacement };

/** A tool's name and description, as shown in tooltips, the library and shortcut lists. */
export interface ToolInfo {
  label: string;
  description: string | undefined;
}

/** The options panel shown while a tool is active. */
export interface ToolPanelEntry {
  tool: string;
  component: ComponentType;
}

/** The options panel shown with the select tool when the selection is all of one element type. */
export interface SelectionPanelEntry {
  type: string;
  component: ComponentType;
}

/** Something placed in one of the editor's slots (side dock, top bar), lowest `order` first. */
export interface SlotEntry {
  id: string;
  order: number;
  component: ComponentType;
}

/** DOM drawn over the canvas (e.g. a video player placed over its element). */
export interface OverlayEntry {
  id: string;
  component: ComponentType;
}

/**
 * Work that runs while an editor is open (e.g. loading link previews), as a React hook called
 * inside the engine's context.
 */
export interface SessionHookEntry {
  id: string;
  use: () => void;
}

/** Items a module adds to the canvas's right-click menu, as one group after the built-in ones. */
export interface ContextMenuEntryGroup {
  id: string;
  menu: "selection" | "canvas";
  /** Shows the items in a submenu of this name instead of in the menu itself. */
  label?: string;
  items: ContextMenuGroup;
}

/**
 * Buttons on the toolbar for what's selected (e.g. Use as mask, the boolean operations), after
 * the tools, while the select tool is on and something is selected; lowest `order` first. A
 * component returns `null` when the selection isn't for it.
 */
export interface SelectionActionEntry {
  id: string;
  order: number;
  component: ComponentType;
}

/**
 * A toolbar that replaces the main one while one of its tools is on (e.g. a vector edit mode's
 * tools and its Done button).
 */
export interface ToolbarModeEntry {
  id: string;
  tools: readonly string[];
  component: ComponentType;
}

/** The points an editor's UI is assembled from. Each product has its own set. */
export interface EditorPoints {
  /** Every tool the editor shows, on the toolbar and/or in the library. */
  tools: ExtensionPoint<ToolEntry>;
  toolPanels: ExtensionPoint<ToolPanelEntry>;
  selectionPanels: ExtensionPoint<SelectionPanelEntry>;
  /** The dock along the right edge (e.g. the database panel). */
  sidePanels: ExtensionPoint<SlotEntry>;
  /** The top bar, between the built-in buttons and the agents menu. */
  topBar: ExtensionPoint<SlotEntry>;
  overlays: ExtensionPoint<OverlayEntry>;
  /** Buttons for the selection on the toolbar (see `SelectionActionEntry`). */
  selectionActions: ExtensionPoint<SelectionActionEntry>;
  sessionHooks: ExtensionPoint<SessionHookEntry>;
  contextMenu: ExtensionPoint<ContextMenuEntryGroup>;
  /** Toolbars shown instead of the main one while their tools are on. */
  toolbars: ExtensionPoint<ToolbarModeEntry>;
}

/** The loaded modules of the editor that's open, and its points. */
export interface EditorModules {
  host: ModuleHost;
  points: EditorPoints;
}

/** One button of the toolbar: a tool, or a menu of tools (see `ToolbarPlacement.menu`). */
export type ToolbarItem = PlacedToolEntry | { menu: string; entries: PlacedToolEntry[] };

export interface ToolMenuButtonProps {
  entries: readonly PlacedToolEntry[];
}

export interface ModuleToolbarProps {
  /** Drawn after the tools (e.g. the library button). */
  children?: ReactNode;
}

export interface ExtensionIconViewProps {
  icon: ExtensionIcon;
  className?: string;
  /** Line width of a Lucide icon. */
  strokeWidth?: number;
}

export interface ModuleSlotProps {
  slot: "sidePanels" | "topBar";
}

export interface SessionHookProps {
  hook: SessionHookEntry;
}
