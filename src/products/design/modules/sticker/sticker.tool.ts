import type { CanvasPointer, Point, Tool, ToolContext } from "@canvas";
import type { PickedSticker } from "@shared/core";

import type { DesignToolOptions } from "../../design-options.types";
import { parentFor } from "../core";
import { createStickerNode, stickerRect } from "./sticker.factory";
import type { StickerNodeElement } from "./sticker.types";

/**
 * Click to stamp the picked sticker centered on the pointer, into the frame under it. The tool
 * stays on, so several can be stamped in a row; a preview follows the pointer.
 */
export class DesignStickerTool implements Tool {
  readonly id = "sticker" as const;
  readonly cursor = "crosshair";
  private preview: StickerNodeElement | null = null;

  constructor(private readonly ctx: ToolContext<DesignToolOptions>) {}

  onHover(p: CanvasPointer): void {
    this.showPreview(p.world);
  }

  onPointerDown(p: CanvasPointer): void {
    const picked = this.ctx.getOptions().sticker;
    if (!picked) return;
    const { doc } = this.ctx;
    doc.checkpoint();
    this.storePicture(picked);
    const node = createStickerNode(picked, stickerRect(p.world), doc.nextIndex(), null);
    const sticker = { ...node, parentId: parentFor(this.ctx, node) };
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
    // The preview draws from the design's assets like any sticker.
    this.storePicture(picked);
    const preview = this.previewOf(picked);
    const { x, y } = stickerRect(at);
    this.preview = { ...preview, x, y };
    this.ctx.setDraft(this.preview);
  }

  /** Stores the picture once per design; every stamp of it points at the same asset. */
  private storePicture(picked: PickedSticker): void {
    const { doc } = this.ctx;
    if (!doc.hasAsset(picked.assetId)) doc.addAsset(picked.assetId, picked.data);
  }

  /** Keeps the preview's id while the same sticker is picked, so its view is reused. */
  private previewOf(picked: PickedSticker): StickerNodeElement {
    if (this.preview?.sticker === picked.sticker) return this.preview;
    return createStickerNode(picked, stickerRect({ x: 0, y: 0 }), this.ctx.doc.nextIndex(), null);
  }
}
