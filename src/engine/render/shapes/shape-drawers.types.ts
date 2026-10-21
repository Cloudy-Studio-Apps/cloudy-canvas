import type { Shape } from "../../document";
import type { ShapeView } from "./shape-view";

export type ShapeDrawer<S extends Shape = Shape> = (view: ShapeView, shape: S) => void;
