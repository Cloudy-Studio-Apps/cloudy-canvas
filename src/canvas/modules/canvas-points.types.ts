import type { ExtensionPoint, Shortcut } from "@shared/core";

import type { CanvasProduct, CanvasScopes, SelectTargetRequest } from "../canvas-product.types";
import type { CanvasViewOptions } from "../canvas-view.types";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKind, ElementKinds, ElementPatch } from "../elements";
import type { Keybindings } from "../input";
import type { EffectRenderer, ElementClip, ElementEffects, ElementMasks } from "../render";
import type { CanvasGuides } from "../ruler-guides";
import type { Rect } from "../geometry.types";
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

/** See `CanvasProduct.orderKeys`; only one module may give the drawing order. */
export type DrawOrderHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => Map<string, string>;

/** See `CanvasProduct.clips`; only one module may give the clips. */
export type ClipsHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => Map<string, ElementClip>;

/** See `CanvasProduct.masks`; only one module may give the masks. */
export type MasksHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => ElementMasks;

/** See `CanvasProduct.effects`; only one module may give the effects. */
export type EffectsHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => ElementEffects;

/** See `CanvasProduct.undrawn`; only one module may give it. */
export type UndrawnHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => ReadonlySet<string>;

/** See `CanvasProduct.selectTarget`; only one module may decide it. */
export type SelectTargetHook<O extends object> = (
  hitId: string,
  request: SelectTargetRequest,
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => string;

/** See `CanvasProduct.alignTarget`; only one module may decide it. */
export type AlignTargetHook<O extends object> = (
  el: CanvasElement,
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => Rect | null;

/** See `CanvasProduct.rulerFrame`; only one module may decide it. */
export type RulerFrameHook<O extends object> = (
  selected: readonly CanvasElement[],
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => CanvasElement | null;

/** See `CanvasProduct.frames`; only one module may give them. */
export type FramesHook<O extends object> = (
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => readonly CanvasElement[];

/** See `CanvasProduct.editElement`; only one module may give it. */
export type EditElementHook<O extends object> = (el: CanvasElement, ctx: ToolContext<O>) => boolean;

/** See `CanvasProduct.onMoved`; hooks run one after another in module order. */
export type OnMovedHook<O extends object> = (
  doc: CanvasDocument,
  moved: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => void;
export type OnRemoveHook = NonNullable<CanvasProduct["onRemove"]>;
export type PrepareCopiesHook = NonNullable<CanvasProduct["prepareCopies"]>;
/** See `CanvasProduct.pasteText`; the first hook that returns an element wins. */
export type PasteTextHook<O extends object> = NonNullable<CanvasProduct<O>["pasteText"]>;
/** See `CanvasProduct.pasteOnto`; the first hook that returns patches wins. */
export type PasteOntoHook<O extends object> = (
  text: string,
  selected: readonly CanvasElement[],
  kinds: ElementKinds<O>,
) => Map<string, ElementPatch> | null;
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
  /** The canvas's zoom range and grid. A value given twice throws. */
  view: ExtensionPoint<Partial<CanvasViewOptions>>;
  /** The scopes the canvas is split into (one module at most; two throw). */
  scopes: ExtensionPoint<CanvasScopes>;
  /** Where the ruler guides are kept (one module at most; two throw). */
  guides: ExtensionPoint<CanvasGuides>;
  /** The drawing order (one module at most; two throw). */
  drawOrder: ExtensionPoint<DrawOrderHook<O>>;
  /** What clips each element (one module at most; two throw). */
  clips: ExtensionPoint<ClipsHook<O>>;
  /** What masks each element (one module at most; two throw). */
  masks: ExtensionPoint<MasksHook<O>>;
  /** Each element's effects (one module at most; two throw). */
  effects: ExtensionPoint<EffectsHook<O>>;
  /** How each type of effect is drawn (keyed by type: two renderers of one type throw). */
  effectRenderers: ExtensionPoint<EffectRenderer>;
  /** What isn't drawn on its own (one module at most; two throw). */
  undrawn: ExtensionPoint<UndrawnHook<O>>;
  /** What a click selects (one module at most; two throw). */
  selectTarget: ExtensionPoint<SelectTargetHook<O>>;
  /** What a single element aligns with (one module at most; two throw). */
  alignTarget: ExtensionPoint<AlignTargetHook<O>>;
  /** What the rulers measure (one module at most; two throw). */
  rulerFrame: ExtensionPoint<RulerFrameHook<O>>;
  /** The frames N and Shift+N step through (one module at most; two throw). */
  frames: ExtensionPoint<FramesHook<O>>;
  /** What double-click or Enter edits (one module at most; two throw). */
  editElement: ExtensionPoint<EditElementHook<O>>;
  onMoved: ExtensionPoint<OnMovedHook<O>>;
  links: ExtensionPoint<() => CanvasLinks>;
  resolveElements: ExtensionPoint<ResolveElementsHook<O>>;
  withMembers: ExtensionPoint<WithMembersHook<O>>;
  onRemove: ExtensionPoint<OnRemoveHook>;
  prepareCopies: ExtensionPoint<PrepareCopiesHook>;
  pasteText: ExtensionPoint<PasteTextHook<O>>;
  pasteOnto: ExtensionPoint<PasteOntoHook<O>>;
  pasteImage: ExtensionPoint<PasteImageHook<O>>;
}
