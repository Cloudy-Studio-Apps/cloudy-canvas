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

/**
 * A toolbar button that switches to a tool. Tools that create an element take their label and
 * description from the element's kind; the others give their own.
 */
export type ToolbarEntry = {
  tool: string;
  icon: ExtensionIcon;
  /** Buttons are grouped by this number (groups are separated by a divider), lowest first. */
  group: number;
  /** Position within the group, lowest first. */
  order: number;
  subTools?: readonly ToolbarSubTool[];
} & ({ element: string } | { label: string; description: string });

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
  items: ContextMenuGroup;
}

/** The points an editor's UI is assembled from. Each product has its own set. */
export interface EditorPoints {
  toolbar: ExtensionPoint<ToolbarEntry>;
  toolPanels: ExtensionPoint<ToolPanelEntry>;
  selectionPanels: ExtensionPoint<SelectionPanelEntry>;
  /** The dock along the right edge (e.g. the database panel). */
  sidePanels: ExtensionPoint<SlotEntry>;
  /** The top bar, between the built-in buttons and the agents menu. */
  topBar: ExtensionPoint<SlotEntry>;
  overlays: ExtensionPoint<OverlayEntry>;
  sessionHooks: ExtensionPoint<SessionHookEntry>;
  contextMenu: ExtensionPoint<ContextMenuEntryGroup>;
}

/** The loaded modules of the editor that's open, and its points. */
export interface EditorModules {
  host: ModuleHost;
  points: EditorPoints;
}

export interface ModuleToolbarProps {
  /** Drawn after the tools (e.g. the library button). */
  children?: ReactNode;
}

export interface ExtensionIconViewProps {
  icon: ExtensionIcon;
  className?: string;
}

export interface ModuleSlotProps {
  slot: "sidePanels" | "topBar";
}

export interface SessionHookProps {
  hook: SessionHookEntry;
}
