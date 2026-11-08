import { SelectTool, type ResizeMode, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DESIGN_PROTOTYPE } from "../model";
import { PROTOTYPE_TOOLS } from "../prototype.constants";

/**
 * The Prototype mode's tool: selects the layer under the pointer (deep, even inside groups),
 * never moving or resizing it. Delete clears the selection's interactions; layers are never
 * deleted here.
 */
export class PrototypeSelectTool extends SelectTool {
  override readonly id = PROTOTYPE_TOOLS.select;
  override readonly resizeMode: ResizeMode = "none";
  override readonly movesSelection = false;
  override readonly editsOnDoubleClick = false;

  constructor(private readonly context: ToolContext<DesignToolOptions>) {
    super({ ...context, targetAt: (world) => context.targetAt(world, true) });
  }

  onCommand(command: string): boolean {
    if (command !== "deleteSelection") return false;
    this.context.service(DESIGN_PROTOTYPE).removeInteractions(this.context.getSelection());
    return true;
  }
}
