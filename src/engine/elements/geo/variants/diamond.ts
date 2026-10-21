import { PolygonVariant } from "./geo-variant";

export class Diamond extends PolygonVariant {
  readonly id = "diamond";
  readonly label = "Diamond";
  readonly defaultSize = { w: 140, h: 120 };

  protected polygon(w: number, h: number): number[] {
    return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
  }
}
