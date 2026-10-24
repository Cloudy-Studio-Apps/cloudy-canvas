import type { ElementBuildContext, ElementDescription, ElementPatch, ElementView } from "@canvas";

import {
  DesignNodeKind,
  drawPaints,
  EMPTY_GEOMETRY,
  imagePaint,
  networkGeometry,
  NODE_STYLE_FIELDS,
  rectNetwork,
  type NodeEffect,
  type NodeGeometry,
} from "../core";
import { readStickerOutline } from "./sticker-args";
import { STICKER_NODE_DEFAULTS } from "./sticker.defaults";
import { stickerOutlineEffects } from "./sticker-outline";
import type { StickerNodeElement } from "./sticker.types";

/** What only stamping and the Sticker section change (the picture follows the edge color). */
const STAMPED_FIELDS = ["sticker", "label", "assetId", "edgeColor"];

/**
 * A sticker on a design: its picture fitted in its box, in proportion. It takes no fills or
 * strokes; its look is the die-cut edge's color and an outline that follows its shape (drawn as
 * an effect, `ownEffects`), plus any effects, opacity and blend mode like other layers. "Convert
 * to vectors" turns an SVG one into layers that can be recolored.
 */
export class StickerNodeKind extends DesignNodeKind<StickerNodeElement> {
  readonly type = "sticker";
  readonly label = "Sticker";
  readonly description = "Stamp a seal, a stamp, an emoji or your own sticker.";
  override readonly tool = "sticker";
  override readonly defaults = STICKER_NODE_DEFAULTS;
  override readonly keepsRatio = true;
  override readonly fillable = false;
  override readonly strokable = false;
  override readonly imageFills = false;
  override readonly styleFields: readonly string[] = [...NODE_STYLE_FIELDS, "outline"];

  draw(view: ElementView, el: StickerNodeElement): void {
    const shown = { ...el, fills: [imagePaint(el.assetId, "fit")], strokes: [] };
    drawPaints(view, shown, this.geometry(el) ?? EMPTY_GEOMETRY, null);
  }

  override geometryKey(el: StickerNodeElement): string {
    return `${el.w},${el.h}`;
  }

  protected override buildGeometry(el: StickerNodeElement): NodeGeometry {
    return networkGeometry(rectNetwork(el.w, el.h, 0), false);
  }

  override ownEffects(el: StickerNodeElement): readonly NodeEffect[] {
    return stickerOutlineEffects(el);
  }

  /** Its picture flips with it (`mirrored`), as pictures do. */
  override mirrorsOnFlip(): boolean {
    return true;
  }

  override assets(el: StickerNodeElement): string[] {
    return [el.assetId];
  }

  override describe(el: StickerNodeElement): ElementDescription {
    return { label: this.layerName(el), kind: el.sticker };
  }

  override fillDefaults(el: StickerNodeElement): StickerNodeElement {
    return {
      ...super.fillDefaults(el),
      edgeColor: el.edgeColor ?? null,
      outline: el.outline ?? null,
    };
  }

  /** Agents may change its outline; its picture and edge only through the sticker tools. */
  override completePatch(
    el: StickerNodeElement,
    patch: ElementPatch<StickerNodeElement>,
    context: ElementBuildContext,
  ): ElementPatch<StickerNodeElement> {
    const stamped = STAMPED_FIELDS.find((field) => field in patch);
    if (stamped) {
      throw new Error(
        `A sticker's "${stamped}" can't be patched: restyle it with restyle_design_stickers.`,
      );
    }
    const next = { ...patch };
    if ("outline" in patch) next.outline = readStickerOutline(patch.outline, el.outline);
    return super.completePatch(el, next, context);
  }
}
