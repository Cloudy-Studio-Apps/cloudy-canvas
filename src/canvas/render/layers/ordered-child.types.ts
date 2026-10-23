import type { Container } from "pixi.js";

/** Something an element layer stacks by drawing order key (a view, or a mask's scope). */
export type OrderedChild = Container & { order: string };
