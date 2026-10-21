export type ShapeType = "sticky" | "text" | "stroke" | "db-table";

export interface ShapeBase {
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

/** DBML relation kind, read from the owning column: `>` many-to-one, `<` one-to-many, `-` one-to-one, `<>` many-to-many. */
export type DbRefKind = ">" | "<" | "-" | "<>";

/** Relation from the owning column to a target column, by id so renames and moves never break it. */
export interface DbRef {
  tableId: string;
  columnId: string;
  kind: DbRefKind;
}

export interface DbColumn {
  id: string;
  name: string;
  type: string;
  pk: boolean;
  increment: boolean;
  notNull: boolean;
  unique: boolean;
  /** Raw DBML default value (e.g. `0`, `'draft'`, `` `now()` ``), or `null` for none. */
  default: string | null;
  note: string;
  ref: DbRef | null;
}

/** One table of the board's database schema. Its size is derived from the columns. */
export interface DbTableShape extends ShapeBase {
  type: "db-table";
  name: string;
  headerColor: string;
  note: string;
  columns: DbColumn[];
}

export type Shape = StickyShape | TextShape | StrokeShape | DbTableShape;

/** Fields that can be changed after creation (id and type are immutable). */
export type ShapePatch = Partial<Omit<StickyShape, "id" | "type">> &
  Partial<Omit<TextShape, "id" | "type">> &
  Partial<Omit<StrokeShape, "id" | "type">> &
  Partial<Omit<DbTableShape, "id" | "type">>;

/** Shapes whose text can be edited in place. */
export type EditableShape = StickyShape | TextShape;
