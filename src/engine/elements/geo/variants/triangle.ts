import { PolygonVariant } from "./geo-variant";

export class Triangle extends PolygonVariant {
  readonly id = "triangle";
  readonly label = "Triangle";
  readonly defaultSize = { w: 130, h: 120 };

  protected polygon(w: number, h: number): number[] {
    return [w / 2, 0, w, h, 0, h];
  }
}
