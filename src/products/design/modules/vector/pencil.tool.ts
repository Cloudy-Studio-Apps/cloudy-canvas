import { FreehandTool } from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { nextLayerName, parentFor } from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import { createVectorLine } from "./vector.factory";
import type { VectorElement } from "./vector.types";
import { t } from "./vector.i18n";

/**
 * Draws freehand vectors (Shift+P), smoothed on release, each into the frame under it. The
 * pencil stays on for the next line, as in Figma.
 */
export class PencilTool extends FreehandTool<DesignToolOptions, VectorElement> {
  readonly id = "pencil";

  protected override smoothing(): number {
    return VECTOR_DEFAULTS.smoothing;
  }

  protected elementFor(points: number[], index: string): VectorElement {
    return createVectorLine(points, "", index, null);
  }

  protected override add(vector: VectorElement): void {
    super.add({
      ...vector,
      name: nextLayerName(this.ctx.doc.all(), t("label")),
      parentId: parentFor(this.ctx, vector),
    });
  }
}
