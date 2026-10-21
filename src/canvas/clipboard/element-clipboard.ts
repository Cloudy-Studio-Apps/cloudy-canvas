import type { Clipboard } from "@shared/core";

import { compareByIndex } from "../document";
import type { CanvasElement } from "../elements";
import { unionRects } from "../geometry";
import type { Point } from "../geometry.types";
import { collectAssets, restoreAssets } from "./clipboard-assets";
import { decodeClipboard, encodeClipboard } from "./clipboard-payload";
import type { ElementClipboardHost } from "./element-clipboard.types";
import { insertCopies } from "./insert-copies";
import type { CopyTarget } from "./insert-copies.types";
import { pasteImage, pasteText } from "./paste-external";
import { pasteOffset } from "./paste-offset";

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
   * what was added.
   */
  async paste(): Promise<void> {
    const { doc, product } = this.host;
    const text = await readSafely(() => this.clipboard.readText());
    const payload = text ? decodeClipboard(text, product.id, product.kinds) : null;
    if (!payload) {
      // An image wins over text: apps that copy an image often add its name or address as text.
      const image = await readSafely(() => this.clipboard.readImage());
      if (image && (await pasteImage(this.host, image))) return;
      if (text) pasteText(this.host, text);
      return;
    }

    restoreAssets(doc, payload.assets);
    this.pastes = text === this.lastText ? this.pastes + 1 : 1;
    this.lastText = text;
    const bounds = unionRects(payload.elements.map((el) => product.kinds.kindOf(el).bounds(el)));
    const offset = pasteOffset(bounds, this.host.visibleRect(), this.pastes);
    const ids = insertCopies(this.target(), payload.elements, offset);
    this.host.select(mapIds(payload.selected, ids));
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
