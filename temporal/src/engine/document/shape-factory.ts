import { createId } from "@core";

import type { Point, Rect } from "../geometry.types";
import { boundsOfPoints } from "../geometry";
import { INK_COLOR } from "./palette";
import {
  CONNECTOR_SIZE,
  GEO_FONT_SIZE,
  LINE_HEIGHT,
  STICKY_SIZE,
  TEXT_FONT_SIZE,
} from "./shape-defaults";
import type {
  ConnectorEnd,
  ConnectorShape,
  ConnectorStyleOptions,
  GeoKind,
  GeoShape,
  SectionShape,
  StickyShape,
  StrokeShape,
  TextShape,
} from "./shapes.types";

/** Sticky note centered on `center`. */
export function createStickyShape(center: Point, color: string, index: string): StickyShape {
  return {
    id: createId(),
    type: "sticky",
    index,
    x: Math.round(center.x - STICKY_SIZE / 2),
    y: Math.round(center.y - STICKY_SIZE / 2),
    w: STICKY_SIZE,
    h: STICKY_SIZE,
    color,
    text: "",
  };
}

/**
 * Empty text shape whose first line is vertically centered on `at`. Its index is assigned
 * when the draft is committed to the document.
 */
export function createTextDraft(at: Point, fontSize = TEXT_FONT_SIZE): TextShape {
  const lineHeight = fontSize * LINE_HEIGHT;
  return {
    id: createId(),
    type: "text",
    index: "",
    x: Math.round(at.x),
    y: Math.round(at.y - lineHeight / 2),
    w: 2,
    h: Math.ceil(lineHeight),
    color: INK_COLOR,
    fontSize,
    text: "",
  };
}

/** Marker stroke from absolute world points; stored relative to its padded bounding box. */
export function createStrokeShape(
  points: number[],
  color: string,
  size: number,
  index: string,
): StrokeShape {
  const bounds = boundsOfPoints(points);
  const pad = size / 2;
  const x = bounds.x - pad;
  const y = bounds.y - pad;
  return {
    id: createId(),
    type: "stroke",
    index,
    x,
    y,
    w: bounds.w + size,
    h: bounds.h + size,
    color,
    size,
    points: points.map((value, i) => (i % 2 === 0 ? value - x : value - y)),
  };
}

export function createGeoShape(
  rect: Rect,
  kind: GeoKind,
  fill: string,
  stroke: string,
  index: string,
): GeoShape {
  return {
    id: createId(),
    type: "geo",
    index,
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.w),
    h: Math.round(rect.h),
    kind,
    fill,
    stroke,
    text: "",
    fontSize: GEO_FONT_SIZE,
  };
}

/** Connector between two ends; its bounds and route are filled in when the scene resolves it. */
export function createConnectorShape(
  start: ConnectorEnd,
  end: ConnectorEnd,
  { style, color, startHead, endHead }: ConnectorStyleOptions,
  index: string,
): ConnectorShape {
  return {
    id: createId(),
    type: "connector",
    index,
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    start,
    end,
    style,
    color,
    size: CONNECTOR_SIZE,
    startHead,
    endHead,
    points: [],
  };
}

export function createSectionShape(
  rect: Rect,
  text: string,
  color: string,
  index: string,
): SectionShape {
  return {
    id: createId(),
    type: "section",
    index,
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.w),
    h: Math.round(rect.h),
    text,
    color,
  };
}
