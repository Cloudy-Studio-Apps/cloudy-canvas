import { connectorEndpoints, SIDES } from "../connectors";
import { columnAnchor, rowTop } from "../db";
import { DB_ROW_H, isConnector, isDbTable } from "../document";
import { unionRects } from "../geometry";
import type { Point } from "../geometry.types";
import {
  canQuickConnect,
  isResizable,
  quickConnectPoint,
  RESIZE_HANDLES,
  resizeHandlePoint,
} from "../handles";
import { shapeBounds } from "../hit-test";
import type { OverlayInput, OverlayState } from "./overlay-state.types";

export function buildOverlayState({
  selected,
  hover,
  marquee,
  dropTarget,
  zoom,
}: OverlayInput): OverlayState {
  // Connectors show their ends instead of a box.
  const boxed = selected.filter((shape) => !isConnector(shape));
  const selection = boxed.map(shapeBounds);
  const withHandles =
    hover && !selected.some((s) => s.id === hover.id) ? [...selected, hover] : selected;

  const handles: Point[] = [];
  for (const shape of withHandles) {
    if (!isDbTable(shape)) continue;
    shape.columns.forEach((_, row) => {
      handles.push(columnAnchor(shape, row, "left"), columnAnchor(shape, row, "right"));
    });
  }

  const endpoints = selected.filter(isConnector).flatMap((connector) => {
    const { start, end } = connectorEndpoints(connector);
    return [start, end];
  });

  const single = selected.length === 1 ? selected[0] : undefined;
  const resizeHandles = isResizable(single)
    ? RESIZE_HANDLES.map((handle) => resizeHandlePoint(single, handle))
    : [];

  const quickConnect: Point[] = [];
  for (const shape of [single, hover]) {
    if (!canQuickConnect(shape) || (shape === hover && shape.id === single?.id)) continue;
    for (const side of SIDES) quickConnect.push(quickConnectPoint(shape, side, zoom));
  }

  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover && !isConnector(hover) ? shapeBounds(hover) : null,
    marquee,
    handles,
    dropTarget: dropTarget && {
      x: dropTarget.table.x,
      y: dropTarget.table.y + rowTop(dropTarget.row),
      w: dropTarget.table.w,
      h: DB_ROW_H,
    },
    resizeHandles,
    endpoints,
    quickConnect,
  };
}
