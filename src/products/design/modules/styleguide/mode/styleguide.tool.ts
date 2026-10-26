import { SelectTool, type ResizeMode, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { STYLEGUIDE_TOOL } from "./styleguide-mode.constants";

/**
 * The Design system mode's tool: selects its sections (click, Shift, marquee) without moving or
 * resizing them; Delete does nothing (the sync keeps them).
 */
export class StyleguideTool extends SelectTool {
  override readonly id = STYLEGUIDE_TOOL;
  override readonly resizeMode: ResizeMode = "none";
  override readonly movesSelection = false;

  constructor(context: ToolContext<DesignToolOptions>) {
    super(context);
  }

  onCommand(command: string): boolean {
    return command === "deleteSelection";
  }
}
