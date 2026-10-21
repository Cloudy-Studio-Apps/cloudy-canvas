export type ShapeType =
  | "sticky"
  | "text"
  | "stroke"
  | "db-table"
  | "db-enum"
  | "geo"
  | "connector"
  | "section"
  | "er-entity"
  | "er-relation"
  | "er-attribute"
  | "er-isa"
  | "er-aggregate"
  | "er-constraint";

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
  /** Set when the sticky is a DBML sticky note (`Note name { … }`), which makes it part of the schema. */
  noteName?: string;
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
  /** Type name without its arguments, e.g. `varchar` (see `formatColumnType`). */
  type: string;
  /** Type arguments, e.g. `255` or `10, 2`; `""` for none. */
  typeArgs: string;
  pk: boolean;
  increment: boolean;
  notNull: boolean;
  unique: boolean;
  /** Raw DBML default value (e.g. `0`, `'draft'`, `` `now()` ``), or `null` for none. */
  default: string | null;
  note: string;
  ref: DbRef | null;
}

/** A column (by id, so renames survive) or a raw expression such as `` `lower(email)` ``. */
export type DbIndexPart = { kind: "column"; columnId: string } | { kind: "expr"; expr: string };

export interface DbIndex {
  id: string;
  parts: DbIndexPart[];
  pk: boolean;
  unique: boolean;
  name: string;
  /** Index method (`btree`, `hash`, …), or empty for the database default. */
  type: string;
  note: string;
}

/** One table of the board's database schema. Its size is derived from the columns. */
export interface DbTableShape extends ShapeBase {
  type: "db-table";
  name: string;
  headerColor: string;
  note: string;
  /** The note bubble is collapsed to its icon. */
  noteHidden: boolean;
  columns: DbColumn[];
  indexes: DbIndex[];
}

export interface DbEnumValue {
  id: string;
  name: string;
  note: string;
}

/** A DBML enum, shown as a card; columns use it by naming it as their type. */
export interface DbEnumShape extends ShapeBase {
  type: "db-enum";
  name: string;
  headerColor: string;
  values: DbEnumValue[];
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

/**
 * A titled area that groups the shapes fully inside it (they move with it). Drawn behind other
 * shapes; nested sections are drawn above the sections around them.
 */
export interface SectionShape extends ShapeBase {
  type: "section";
  /** The section's title. */
  text: string;
  color: string;
}

/** An ER (Chen notation) entity: a rectangle, doubled when weak. Its size comes from the name. */
export interface ErEntityShape extends ShapeBase {
  type: "er-entity";
  name: string;
  weak: boolean;
  color: string;
}

/** One entity (or aggregation) taking part in an ER relation, by id so renames and moves never break it. */
export interface ErParticipant {
  id: string;
  /** An `er-entity` or an `er-aggregate`. */
  entityId: string;
  /** Cardinality, e.g. `0` and `n` for `(0,n)`; both empty when none was given. */
  min: string;
  max: string;
  /** Role name for unary relations (`Empleado (0,1) as jefe`), or empty. */
  role: string;
  /** An arrowhead at the entity end. */
  arrow: boolean;
}

/** An ER relation: a diamond linked to its participants. */
export interface ErRelationShape extends ShapeBase {
  type: "er-relation";
  name: string;
  /** Drawn as a double diamond. */
  identifying: boolean;
  /** Drawn with an "I" bar at the top corner (dependency by identification). */
  idMark: boolean;
  color: string;
  participants: ErParticipant[];
}

export type ErAttributeKey = "none" | "pk" | "partial";

/** Chen ellipses, or small "lollipop" circles on sticks. */
export type ErAttributeLook = "ellipse" | "lollipop";

/**
 * An ER attribute, linked to its owner: an entity, a relation, a composite attribute, a hierarchy
 * (its discriminator) or an aggregation.
 */
export interface ErAttributeShape extends ShapeBase {
  type: "er-attribute";
  ownerId: string;
  name: string;
  key: ErAttributeKey;
  /** Drawn as a double ellipse. */
  multivalued: boolean;
  /** Drawn dashed. */
  derived: boolean;
  /** Drawn half-filled in the lollipop look. */
  optional: boolean;
  look: ErAttributeLook;
  /** Position among the owner's attributes, so the text keeps their order. */
  order: number;
}

/** One specialized entity of a hierarchy. */
export interface ErIsaChild {
  id: string;
  entityId: string;
  min: string;
  max: string;
}

/** A generalization / specialization ("ES UN" triangle) from a parent entity to its children. */
export interface ErIsaShape extends ShapeBase {
  type: "er-isa";
  parentId: string;
  /** Cardinality shown on the parent's line, or empty. */
  parentMin: string;
  parentMax: string;
  /** Exclusive (an arc under the triangle) rather than overlapping. */
  exclusive: boolean;
  /** Total (a small circle on the parent's line) rather than partial. */
  total: boolean;
  children: ErIsaChild[];
}

/**
 * An aggregation: a box around a relation and its participants that takes part in other relations
 * like an entity. Its bounds are derived from those shapes whenever the board changes.
 */
export interface ErAggregateShape extends ShapeBase {
  type: "er-aggregate";
  name: string;
  relationId: string;
}

export type ErConstraintKind = "exclusive" | "inclusive" | "exclusion" | "inclusion";

/**
 * A constraint between two relations. Exclusive and inclusive ones are about how one entity takes
 * part in both; inclusion and inclusive ones point from `fromId` (the requirement) to `toId`.
 * Its bounds and `points` are derived from the shapes it connects.
 */
export interface ErConstraintShape extends ShapeBase {
  type: "er-constraint";
  rule: ErConstraintKind;
  /** The entity, for exclusive and inclusive constraints; otherwise empty. */
  entityId: string;
  fromId: string;
  toId: string;
  /** Cardinality of an inclusive constraint, e.g. `(2,n)`; otherwise empty. */
  min: string;
  max: string;
  /** Resolved drawing, relative to (x, y): see `er/resolve-constraint.ts`. */
  points: number[];
}

export type ErShape =
  | ErEntityShape
  | ErRelationShape
  | ErAttributeShape
  | ErIsaShape
  | ErAggregateShape
  | ErConstraintShape;

/** Looks of a connector, shared by the connector tool options and new connectors. */
export interface ConnectorStyleOptions {
  style: ConnectorStyle;
  color: string;
  startHead: ArrowHead;
  endHead: ArrowHead;
}

export type Shape =
  | StickyShape
  | TextShape
  | StrokeShape
  | DbTableShape
  | DbEnumShape
  | GeoShape
  | ConnectorShape
  | SectionShape
  | ErEntityShape
  | ErRelationShape
  | ErAttributeShape
  | ErIsaShape
  | ErAggregateShape
  | ErConstraintShape;

/** Fields that can be changed after creation (id and type are immutable). */
export type ShapePatch = Partial<Omit<StickyShape, "id" | "type">> &
  Partial<Omit<TextShape, "id" | "type">> &
  Partial<Omit<StrokeShape, "id" | "type">> &
  Partial<Omit<DbTableShape, "id" | "type">> &
  Partial<Omit<DbEnumShape, "id" | "type">> &
  Partial<Omit<GeoShape, "id" | "type">> &
  Partial<Omit<ConnectorShape, "id" | "type">> &
  Partial<Omit<SectionShape, "id" | "type">> &
  Partial<Omit<ErEntityShape, "id" | "type">> &
  Partial<Omit<ErRelationShape, "id" | "type">> &
  Partial<Omit<ErAttributeShape, "id" | "type">> &
  Partial<Omit<ErIsaShape, "id" | "type">> &
  Partial<Omit<ErAggregateShape, "id" | "type">> &
  Partial<Omit<ErConstraintShape, "id" | "type">>;

/** Shapes whose text can be edited in place. */
export type EditableShape = StickyShape | TextShape | GeoShape | SectionShape | ErNamedShape;

/** ER shapes renamed in place with the text editor. */
export type ErNamedShape = ErEntityShape | ErRelationShape | ErAttributeShape | ErAggregateShape;

/** Shapes connectors can attach to. */
export type ConnectableShape =
  | StickyShape
  | TextShape
  | DbTableShape
  | DbEnumShape
  | GeoShape
  | ErEntityShape
  | ErRelationShape
  | ErAttributeShape;
