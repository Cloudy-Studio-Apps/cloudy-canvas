import type { ExtensionPoint, Shortcut } from "@shared/core";

import type { CanvasProduct } from "../canvas-product.types";
import type { CanvasElement, ElementKind, ElementKinds } from "../elements";
import type { Keybindings } from "../input";
import type { CanvasLinks } from "../links";
import type { Tool, ToolContext } from "../tools";

/** A tool a module adds, with its shortcuts (bound to `tool.<id>`). */
export interface ProductTool<O extends object> {
  id: string;
  create(ctx: ToolContext<O>): Tool;
  keys?: readonly Shortcut[];
}

/** A command the editor implements (see `CanvasProduct.hostCommands`). */
export interface HostCommand {
  id: string;
  /** Its name in shortcut lists and tooltips. */
  label: string;
  keys?: readonly Shortcut[];
}

/** See `CanvasProduct.resolveElements`; hooks run one after another in module order. */
export type ResolveElementsHook<O extends object> = (
  elements: CanvasElement[],
  kinds: ElementKinds<O>,
) => CanvasElement[];

/** See `CanvasProduct.withMembers`; each hook adds to what the earlier ones returned. */
export type WithMembersHook<O extends object> = (
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  purpose: "move" | "delete",
  kinds: ElementKinds<O>,
) => Set<string>;

export type OnRemoveHook = NonNullable<CanvasProduct["onRemove"]>;
export type PrepareCopiesHook = NonNullable<CanvasProduct["prepareCopies"]>;
/** See `CanvasProduct.pasteText`; the first hook that returns an element wins. */
export type PasteTextHook<O extends object> = NonNullable<CanvasProduct<O>["pasteText"]>;
/** See `CanvasProduct.pasteImage`; the first hook that returns an element wins. */
export type PasteImageHook<O extends object> = NonNullable<CanvasProduct<O>["pasteImage"]>;

/**
 * The points a product's canvas is assembled from (`composeProduct`). Each product has its own
 * set (`createCanvasPoints`), typed with its tool options `O`.
 */
export interface CanvasPoints<O extends object> {
  kinds: ExtensionPoint<ElementKind<CanvasElement, O>>;
  tools: ExtensionPoint<ProductTool<O>>;
  hostCommands: ExtensionPoint<HostCommand>;
  /** Shortcuts of other commands. A command bound twice throws. */
  keybindings: ExtensionPoint<Keybindings>;
  /** Default values of the tool options a module owns. An option given twice throws. */
  options: ExtensionPoint<Partial<O>>;
  links: ExtensionPoint<() => CanvasLinks>;
  resolveElements: ExtensionPoint<ResolveElementsHook<O>>;
  withMembers: ExtensionPoint<WithMembersHook<O>>;
  onRemove: ExtensionPoint<OnRemoveHook>;
  prepareCopies: ExtensionPoint<PrepareCopiesHook>;
  pasteText: ExtensionPoint<PasteTextHook<O>>;
  pasteImage: ExtensionPoint<PasteImageHook<O>>;
}
