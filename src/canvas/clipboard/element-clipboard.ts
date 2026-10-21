import type { Clipboard } from "@shared/core";

import { compareByIndex } from "../document";
import type { CanvasElement } from "../elements";
import { unionRects } from "../geometry";
import type { Point } from "../geometry.types";
import { decodeClipboard, encodeClipboard } from "./clipboard-payload";
import type { ElementClipboardHost } from "./element-clipboard.types";
import { insertCopies } from "./insert-copies";
import type { CopyTarget } from "./insert-copies.types";
import { pasteOffset } from "./paste-offset";

/**
 * Copy, paste and duplicate for one engine. Copied elements go to the clipboard as JSON (with
 * what moves with them), so they paste into any canvas of the same product; other text is pasted
 * through the product's `pasteText`.
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
    const text = encodeClipboard(this.host.product.id, elements, selected);
    this.lastText = text;
    this.pastes = 0;
    this.clipboard
      .writeText(text)
      .catch((error: unknown) => console.warn("[clipboard] Couldn't copy:", error));
    return true;
  }

  /** Pastes the clipboard's elements, or its text as an element, and selects what was added. */
  async paste(): Promise<void> {
    let text: string | null;
    try {
      text = await this.clipboard.readText();
    } catch (error) {
      console.warn("[clipboard] Couldn't paste:", error);
      return;
    }
    if (!text) return;

    const { product } = this.host;
    const payload = decodeClipboard(text, product.id, product.kinds);
    if (!payload) return this.pasteText(text);

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

  private pasteText(text: string): void {
    const { doc, product } = this.host;
    const visible = this.host.visibleRect();
    const center = { x: visible.x + visible.w / 2, y: visible.y + visible.h / 2 };
    const el = product.pasteText?.(text, center, doc.nextIndex(), this.host.getOptions());
    if (!el) return;
    doc.checkpoint();
    doc.add(el);
    this.host.select([el.id]);
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

function mapIds(ids: readonly string[], map: ReadonlyMap<string, string>): string[] {
  return ids.map((id) => map.get(id)).filter((id): id is string => id !== undefined);
}
