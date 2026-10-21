import type {
  ConnectableShape,
  ConnectorShape,
  DbTableShape,
  EditableShape,
  GeoShape,
  SectionShape,
  Shape,
} from "./shapes.types";

export function isEditableShape(shape: Shape | undefined): shape is EditableShape {
  return (
    shape?.type === "sticky" ||
    shape?.type === "text" ||
    shape?.type === "geo" ||
    shape?.type === "section"
  );
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
    shape?.type === "db-table"
  );
}

export function isSection(shape: Shape | undefined): shape is SectionShape {
  return shape?.type === "section";
}
