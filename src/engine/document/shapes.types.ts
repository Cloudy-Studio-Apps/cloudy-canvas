export type ShapeType = "sticky" | "text" | "stroke" | "db-table" | "geo" | "connector";

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

export type GeoKind =
  | "rectangle"
  | "rounded"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "parallelogram"
  | "cylinder"
  | "star";

/** A basic diagram shape with a centered label. */
export interface GeoShape extends ShapeBase {
  type: "geo";
  kind: GeoKind;
  fill: string;
  stroke: string;
  text: string;
  fontSize: number;
}

export type ConnectorSide = "top" | "right" | "bottom" | "left";

/** One end of a connector: stuck to a shape, or free at (x, y) in world coordinates. */
export interface ConnectorEnd {
  shapeId: string | null;
  /** Side of the shape it leaves from; `null` picks the side facing the other end. */
  side: ConnectorSide | null;
  /** Free position, and the fallback if the attached shape disappears. */
  x: number;
  y: number;
}

export type ConnectorStyle = "straight" | "elbow";
export type ArrowHead = "none" | "arrow";

/**
 * A line between two ends that follows the shapes it's attached to. Its bounds and `points` are
 * derived from the ends whenever the board changes (see `connectors/resolve-connector.ts`).
 */
export interface ConnectorShape extends ShapeBase {
  type: "connector";
  start: ConnectorEnd;
  end: ConnectorEnd;
  style: ConnectorStyle;
  color: string;
  /** Line thickness in world units. */
  size: number;
  startHead: ArrowHead;
  endHead: ArrowHead;
  /** Route as a flat [x0, y0, x1, y1, …] list, relative to (x, y). */
  points: number[];
}

/** Looks of a connector, shared by the connector tool options and new connectors. */
export interface ConnectorStyleOptions {
  style: ConnectorStyle;
  color: string;
  startHead: ArrowHead;
  endHead: ArrowHead;
}

export type Shape =
  StickyShape | TextShape | StrokeShape | DbTableShape | GeoShape | ConnectorShape;

/** Fields that can be changed after creation (id and type are immutable). */
export type ShapePatch = Partial<Omit<StickyShape, "id" | "type">> &
  Partial<Omit<TextShape, "id" | "type">> &
  Partial<Omit<StrokeShape, "id" | "type">> &
  Partial<Omit<DbTableShape, "id" | "type">> &
  Partial<Omit<GeoShape, "id" | "type">> &
  Partial<Omit<ConnectorShape, "id" | "type">>;

/** Shapes whose text can be edited in place. */
export type EditableShape = StickyShape | TextShape | GeoShape;

/** Shapes connectors can attach to. */
export type ConnectableShape = StickyShape | TextShape | DbTableShape | GeoShape;
