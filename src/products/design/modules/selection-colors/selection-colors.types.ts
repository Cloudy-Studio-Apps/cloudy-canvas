/** Where one use of a color is stored: a node and the path of its `color` field. */
export interface ColorRef {
  nodeId: string;
  /** `fills.0.color`, `strokes.1.stops.2.color`, `runs.3.style.fills.0.color`, … */
  path: string;
}

/** One color the selection uses, with every place that uses it. */
export interface SelectionColor {
  /** The color and its opacity, e.g. `#ff0000@50`: what tells two entries apart. */
  key: string;
  /** `#rrggbb`, lower case. */
  color: string;
  /** 0–1. */
  opacity: number;
  refs: ColorRef[];
}
