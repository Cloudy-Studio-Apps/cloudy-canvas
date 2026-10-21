import type { CanvasPointer, Point, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createSticker, type PickedSticker, type StickerElement } from "../elements";

/**
 * Click to stamp the picked sticker centered on the pointer. The tool stays on, so several can be
 * stamped in a row; a preview follows the pointer.
 */
export class StickerTool implements Tool {
  readonly id = "sticker" as const;
  readonly cursor = "crosshair";
  private preview: StickerElement | null = null;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onHover(p: CanvasPointer): void {
    this.showPreview(p.world);
  }

  onPointerDown(p: CanvasPointer): void {
    const picked = this.ctx.getOptions().sticker;
    if (!picked) return;
    const { doc } = this.ctx;
    doc.checkpoint();
    this.storePicture(picked);
    const sticker = createSticker(picked, p.world, doc.nextIndex());
    doc.add(sticker);
    this.ctx.setSelection([]);
    // The preview would hide the pop; it comes back when the pointer moves.
    this.onCancel();
    this.ctx.animateIn([sticker.id]);
  }

  onPointerMove(p: CanvasPointer): void {
    this.showPreview(p.world);
  }

  onCancel(): void {
    this.preview = null;
    this.ctx.setDraft(null);
  }

  private showPreview(at: Point): void {
    const picked = this.ctx.getOptions().sticker;
    if (!picked) return this.onCancel();
    // The preview draws from the board's assets like any sticker.
    this.storePicture(picked);
    const preview = this.previewOf(picked);
    const placed = createSticker(picked, at, preview.index);
    this.preview = { ...preview, x: placed.x, y: placed.y };
    this.ctx.setDraft(this.preview);
  }

  /** Stores the picture once per board; every stamp of it points at the same asset. */
  private storePicture(picked: PickedSticker): void {
    const { doc } = this.ctx;
    if (!doc.hasAsset(picked.assetId)) doc.addAsset(picked.assetId, picked.data);
  }

  /** Keeps the preview's id while the same sticker is picked, so its view is reused. */
  private previewOf(picked: PickedSticker): StickerElement {
    if (this.preview?.sticker === picked.sticker) return this.preview;
    return createSticker(picked, { x: 0, y: 0 }, this.ctx.doc.nextIndex());
  }
}
