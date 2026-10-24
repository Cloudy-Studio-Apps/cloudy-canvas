import type { Clipboard } from "@shared/core";

import { compareByIndex } from "../document";
import { elementBounds, type CanvasElement } from "../elements";
import { rectCenter, unionRects } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import { collectAssets, restoreAssets } from "./clipboard-assets";
import { decodeClipboard, encodeClipboard, isCanvasClipboard } from "./clipboard-payload";
import type { ElementClipboardHost, PasteOptions } from "./element-clipboard.types";
import { insertCopies } from "./insert-copies";
import type { CopyTarget } from "./insert-copies.types";
import { pasteImage, pasteText } from "./paste-external";
import { centerOffset, pasteOffset } from "./paste-offset";

/**
 * Copy, paste and duplicate for one engine. Copied elements go to the clipboard as JSON (with
 * what moves with them and the assets they show), so they paste into any canvas of the same
 * product; images and other text are pasted through the product's `pasteImage` and `pasteText`.
 */
export class ElementClipboard<O extends object> {
  /** The text last copied or pasted, and how many times it was pasted in a row. */
  private lastText: string | null = null;
  private pastes = 0;

  constructor(
    private readonly host: ElementClipboardHost<O>,
    private readonly clipboard: Clipboard,
  ) {}

  /** Copies the elements to the clipboard. Returns `false` when there was nothing to copy. */
  copy(ids: Iterable<string>): boolean {
    const selected = [...ids];
    const elements = this.collect(selected);
    if (elements.length === 0) return false;
    const { doc, product } = this.host;
    const assets = collectAssets(doc, product.kinds, elements);
    const text = encodeClipboard(product.id, elements, selected, assets);
    this.lastText = text;
    this.pastes = 0;
    this.clipboard
      .writeText(text)
      .catch((error: unknown) => console.warn("[clipboard] Couldn't copy:", error));
    return true;
  }

  /**
   * Pastes the clipboard's elements, or else its image or its text as an element, and selects
   * what was added. With `replace`, what's pasted is centered on those elements, which are
   * removed in the same undo step.
   */
  async paste({ replace }: PasteOptions = {}): Promise<void> {
    const { doc, product } = this.host;
    const replaced = replace ? this.boundsOf(replace) : null;
    const at = replaced ? rectCenter(replaced) : undefined;
    const text = await readSafely(() => this.clipboard.readText());
    const foreign = product.pasteForeign?.bind(product);
    const payload = text ? decodeClipboard(text, product.id, product.kinds, foreign) : null;
    if (!payload && text && !replace && this.pasteOnto(text)) return;
    if (!payload) {
      // An image wins over text: apps that copy an image often add its name or address as text.
      const image = await readSafely(() => this.clipboard.readImage());
      const pasted =
        (image !== null && (await pasteImage(this.host, image, at))) ||
        // Elements of another product that this one can't take aren't pasted as their JSON.
        (!!text && !isCanvasClipboard(text) && pasteText(this.host, text, at));
      if (pasted && replace) this.host.remove(replace);
      return;
    }

    restoreAssets(doc, payload.assets);
    this.pastes = text === this.lastText ? this.pastes + 1 : 1;
    this.lastText = text;
    const bounds = unionRects(
      payload.elements.map((el) => elementBounds(product.kinds.kindOf(el), el)),
    );
    const offset = at
      ? centerOffset(bounds, at)
      : pasteOffset(bounds, this.host.visibleRect(), this.pastes);
    const ids = insertCopies(this.target(), payload.elements, offset);
    // Removed right after the copies are added, so both are one undo step.
    if (replace && ids.size > 0) this.host.remove(replace);
    this.host.select(mapIds(payload.selected, ids));
  }

  /** Applies the text to the selection through the product's `pasteOnto`, as one undo step. */
  private pasteOnto(text: string): boolean {
    const { doc, product } = this.host;
    if (!product.pasteOnto) return false;
    const selected = this.host
      .selected()
      .map((id) => this.host.getElement(id))
      .filter((el): el is CanvasElement => el !== undefined);
    if (selected.length === 0) return false;
    const patches = product.pasteOnto(text, selected);
    if (!patches || patches.size === 0) return false;
    doc.checkpoint();
    doc.updateMany(patches);
    return true;
  }

  /** Adds copies of the elements (with what moves with them) moved by `offset`; old id → copy id. */
  duplicate(ids: Iterable<string>, offset: Point): Map<string, string> {
    return insertCopies(this.target(), this.collect(ids), offset);
  }

  /** The elements with what moves with them, as the scene has them, bottom to top. */
  private collect(ids: Iterable<string>): CanvasElement[] {
    return [...this.host.withMembers(ids)]
      .map((id) => this.host.getElement(id))
      .filter((el): el is CanvasElement => el !== undefined)
      .sort(compareByIndex);
  }

  /** Bounds of the elements on the canvas, or `null` when none of them is. */
  private boundsOf(ids: readonly string[]): Rect | null {
    const elements = ids
      .map((id) => this.host.getElement(id))
      .filter((el): el is CanvasElement => el !== undefined);
    return unionRects(elements.map((el) => elementBounds(this.host.product.kinds.kindOf(el), el)));
  }

  private target(): CopyTarget {
    const { doc, product } = this.host;
    return {
      doc,
      kinds: product.kinds,
      existing: this.host.elements(),
      prepare: product.prepareCopies?.bind(product),
    };
  }
}

async function readSafely<T>(read: () => Promise<T | null>): Promise<T | null> {
  try {
    return await read();
  } catch (error) {
    console.warn("[clipboard] Couldn't read the clipboard:", error);
    return null;
  }
}

function mapIds(ids: readonly string[], map: ReadonlyMap<string, string>): string[] {
  return ids.map((id) => map.get(id)).filter((id): id is string => id !== undefined);
}
