import type {
  ConnectableShape,
  ConnectorShape,
  DbEnumShape,
  DbTableShape,
  EditableShape,
  ErNamedShape,
  ErShape,
  GeoShape,
  SectionShape,
  Shape,
} from "./shapes.types";

export function isEditableShape(shape: Shape | undefined): shape is EditableShape {
  return (
    shape?.type === "sticky" ||
    shape?.type === "text" ||
    shape?.type === "geo" ||
    shape?.type === "section" ||
    isErNamed(shape)
  );
}

/** ER shapes whose name is edited in place. */
export function isErNamed(shape: Shape | undefined): shape is ErNamedShape {
  return (
    shape?.type === "er-entity" ||
    shape?.type === "er-relation" ||
    shape?.type === "er-attribute" ||
    shape?.type === "er-aggregate"
  );
}

/** The text an editable shape shows: its text, or an ER shape's name. */
export function editableText(shape: EditableShape): string {
  return isErNamed(shape) ? shape.name : shape.text;
}

export function isDbTable(shape: Shape | undefined): shape is DbTableShape {
  return shape?.type === "db-table";
}

export function isGeo(shape: Shape | undefined): shape is GeoShape {
  return shape?.type === "geo";
}

export function isConnector(shape: Shape | undefined): shape is ConnectorShape {
  return shape?.type === "connector";
}

export function isConnectable(shape: Shape | undefined): shape is ConnectableShape {
  return (
    shape?.type === "geo" ||
    shape?.type === "sticky" ||
    shape?.type === "text" ||
    shape?.type === "db-table" ||
    shape?.type === "db-enum" ||
    shape?.type === "er-entity" ||
    shape?.type === "er-relation" ||
    shape?.type === "er-attribute"
  );
}

export function isDbEnum(shape: Shape | undefined): shape is DbEnumShape {
  return shape?.type === "db-enum";
}

export function isSection(shape: Shape | undefined): shape is SectionShape {
  return shape?.type === "section";
}

export function isErShape(shape: Shape | undefined): shape is ErShape {
  return shape?.type.startsWith("er-") ?? false;
}
