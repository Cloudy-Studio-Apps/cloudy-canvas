import {
  selectAndEdit,
  type CanvasPointer,
  type Tool,
  type ToolContext,
  TokenStore,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { createSticky } from "./sticky.factory";
import { newColorBindings } from "../../tokens";
import { STICKY_DEFAULTS } from "./sticky.defaults";

/** Click to drop a sticky note centered on the pointer, then type into it. */
export class StickyTool implements Tool {
  readonly id = "sticky" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const options = this.ctx.getOptions();
    const sticky = {
      ...createSticky(p.world, options.stickyColor, doc.nextIndex()),
      ...newColorBindings(options, STICKY_DEFAULTS.colorOptions, TokenStore.of(this.ctx.doc)),
    };
    doc.checkpoint();
    doc.add(sticky);
    selectAndEdit(this.ctx, sticky.id);
  }
}
