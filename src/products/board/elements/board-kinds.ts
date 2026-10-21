import { ElementKinds } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { GeoKind } from "./geo";
import { StickyKind } from "./sticky";
import { StrokeKind } from "./stroke";

/**
 * Every element type a board can hold. The built-ins are registered here; plugins call
 * `boardKinds.register(new MyKind())` before a board opens.
 */
export const boardKinds = new ElementKinds<BoardToolOptions>();
boardKinds.register(new StickyKind());
boardKinds.register(new StrokeKind());
boardKinds.register(new GeoKind());
