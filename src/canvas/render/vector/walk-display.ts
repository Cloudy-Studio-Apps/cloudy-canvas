import { Container, Graphics, Sprite, Text, TilingSprite } from "pixi.js";

import { ElementView } from "../element-view";
import { EffectScopeView } from "../layers/effect-scope-view";
import { MaskScopeView } from "../layers/mask-scope-view";
import { RichTextSprite } from "../rich-text-sprite";
import { cssBlendMode } from "./blend-mode";
import { flatten } from "./flatten";
import { matrixValue, num } from "./svg-format";
import type { SvgContext } from "./svg-context.types";
import { writeEffectScope } from "./write-effects";
import { writeGraphics } from "./write-graphics";
import { writeSprite, writeTiles } from "./write-image";
import { clipAttr, maskAttr, writeMaskScope } from "./write-mask";
import { writeText } from "./write-text";

/** What a container's children draw: masks and what's never drawn on its own are left out. */
export function writeChildren(node: Container, w: SvgContext): string {
  const masks = new Set<unknown>([node.mask, ...node.children.map((child) => child.mask)]);
  return node.children
    .filter((child) => child.includeInBuild && !masks.has(child))
    .map((child) => writeNode(child, w))
    .join("");
}

/**
 * One display object as markup, with its place, opacity, blend mode and clip: what can't be
 * written is drawn as a picture, on its own, so everything round it stays vector.
 */
function writeNode(node: Container, w: SvgContext): string {
  if (!node.visible || !node.renderable || node.alpha <= 0) return "";
  const body = bodyOf(node, w);
  if (body === null) return flatten(node, w, { world: isScope(node), reach: reachOf(node) });
  if (!body) return "";
  // Texts place themselves; a rich text's sprite sits at its ink, not at its layout's origin.
  const placed = node instanceof Text || node instanceof RichTextSprite;
  const own = node instanceof MaskScopeView ? null : node.mask;
  const clip = own === null || own === undefined ? null : maskOf(node, own, w);
  if (clip === undefined) return flatten(node, w, { world: isScope(node), reach: reachOf(node) });
  // A clip that's the node's child is in the node's coordinates, a sibling in its parent's.
  const inside = own instanceof Container && own.parent === node;
  const attrs: string[] = [];
  if (!placed) {
    node.updateLocalTransform();
    const transform = matrixValue(node.localTransform);
    if (transform) attrs.push(`transform="${transform}"`);
  }
  if (node.alpha < 1) attrs.push(`opacity="${num(node.alpha)}"`);
  const blend = cssBlendMode(node.blendMode);
  if (blend) attrs.push(`style="mix-blend-mode:${blend}"`);
  if (clip && inside) return wrap(wrap(body, [clip]), attrs);
  return wrap(wrap(body, attrs), clip ? [clip] : []);
}

function wrap(body: string, attrs: readonly string[]): string {
  return attrs.length > 0 ? `<g ${attrs.join(" ")}>${body}</g>` : body;
}

/** What the node itself draws; `null` when it can't be written. */
function bodyOf(node: Container, w: SvgContext): string | null {
  if (node instanceof MaskScopeView) return writeMaskScope(node, w);
  if (node instanceof EffectScopeView) return writeEffectScope(node, w);
  if (node.filters && (Array.isArray(node.filters) ? node.filters.length > 0 : true)) return null;
  if (node instanceof Graphics) return writeGraphics(node, w);
  if (node instanceof Text || node instanceof RichTextSprite) return writeText(node, w);
  if (node instanceof TilingSprite) return writeTiles(node, w);
  if (node instanceof Sprite) return writeSprite(node, w);
  // Anything else that draws (a plugin's mesh) has no writing.
  if ((node as { renderPipeId?: string }).renderPipeId) return null;
  return writeChildren(node, w);
}

/**
 * The attribute masking a node: a clip of a `Graphics`, or a mask of the text the paints show
 * through. `undefined` when it can't be written.
 */
function maskOf(node: Container, mask: unknown, w: SvgContext): string | null | undefined {
  if (mask instanceof Graphics) return clipAttr(mask, w) ?? undefined;
  const view = node.parent;
  if (mask instanceof Sprite && view instanceof ElementView && view.maskingText) {
    return maskAttr(writeText(view.maskingText, w, true), w, false);
  }
  return undefined;
}

function isScope(node: Container): boolean {
  return node instanceof EffectScopeView || node instanceof MaskScopeView;
}

function reachOf(node: Container): number {
  return node instanceof EffectScopeView ? node.outset : 0;
}
