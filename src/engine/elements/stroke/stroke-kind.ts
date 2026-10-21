import type { ElementView } from "../../render/element-view";
import { LineKind } from "../bases/line-kind";
import { drawStroke } from "./draw-stroke";
import type { StrokeElement } from "./stroke.types";

/** Freehand strokes: drawn with the marker, then only moved (their points are the content). */
export class StrokeKind extends LineKind<StrokeElement> {
  readonly type = "stroke";
  readonly label = "Marker stroke";
  override readonly creatable = false;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y"]);

  draw(view: ElementView, el: StrokeElement): void {
    drawStroke(view, el);
  }

  protected lineWidth(el: StrokeElement): number {
    return el.size;
  }
}
