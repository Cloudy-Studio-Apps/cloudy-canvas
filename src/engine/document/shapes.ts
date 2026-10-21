export type ShapeType = "sticky" | "text" | "stroke";

interface ShapeBase {
  id: string;
  type: ShapeType;
  /** Fractional index (fractional-indexing) — lexicographic order is z-order. */
  index: string;
  /** Top-left corner in world coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StickyShape extends ShapeBase {
  type: "sticky";
  color: string;
  text: string;
}

export interface TextShape extends ShapeBase {
  type: "text";
  color: string;
  text: string;
  fontSize: number;
}

export interface StrokeShape extends ShapeBase {
  type: "stroke";
  color: string;
  /** Marker thickness in world units. */
  size: number;
  /** Flat [x0, y0, x1, y1, …] list, relative to (x, y). */
  points: number[];
}

export type Shape = StickyShape | TextShape | StrokeShape;

/** Fields that can be changed after creation (id and type are immutable). */
export type ShapePatch = Partial<Omit<StickyShape, "id" | "type">> &
  Partial<Omit<TextShape, "id" | "type">> &
  Partial<Omit<StrokeShape, "id" | "type">>;

/** Shapes whose text can be edited in place. */
export type EditableShape = StickyShape | TextShape;

export function isEditableShape(shape: Shape | undefined): shape is EditableShape {
  return shape?.type === "sticky" || shape?.type === "text";
}
