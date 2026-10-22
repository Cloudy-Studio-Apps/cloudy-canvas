export type MockLayerType = "frame" | "group" | "component" | "rectangle" | "text" | "image";

export interface MockLayer {
  id: string;
  name: string;
  type: MockLayerType;
  children?: MockLayer[];
}

/** A top-level frame drawn on the mock canvas, in canvas pixels. */
export interface MockFrame {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Fill of the frame body; content colors are document data, not theme tokens. */
  fill: string;
  /** Bars drawn inside the frame to suggest content, as fractions of its size. */
  blocks: MockBlock[];
}

export interface MockBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}
