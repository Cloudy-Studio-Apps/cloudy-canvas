import type { CSSProperties } from "react";

import type { ToolArgs } from "@canvas";

/** A spec's first paint as a CSS background (a solid color or a CSS gradient). */
function background(args: ToolArgs): string | undefined {
  const fills = args.fills;
  const first = Array.isArray(fills) ? (fills[0] as unknown) : undefined;
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "color" in first) {
    const { color, opacity } = first as { color: string; opacity?: number };
    const alpha = Math.round((opacity ?? 1) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${color.slice(0, 7)}${alpha}`;
  }
  return typeof args.fill === "string" ? args.fill : undefined;
}

/** A spec's padding as CSS (a number, `[vertical, horizontal]`, four sides or an object). */
function padding(value: unknown): string | undefined {
  if (typeof value === "number") return `${value}px`;
  if (Array.isArray(value)) return value.map((n) => `${Number(n)}px`).join(" ");
  if (value && typeof value === "object") {
    const { top = 0, right = 0, bottom = 0, left = 0 } = value as Record<string, number>;
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
  return undefined;
}

const ALIGN: Record<string, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
};

/** The CSS that draws a generated layer as the canvas would (close enough for a thumbnail). */
export function specStyle(args: ToolArgs): CSSProperties {
  const style: CSSProperties = {
    boxSizing: "border-box",
    flexShrink: 0,
    background: background(args),
    opacity: typeof args.opacity === "number" ? args.opacity : undefined,
    borderRadius: typeof args.cornerRadius === "number" ? args.cornerRadius : undefined,
  };
  const sizing = (args.sizing ?? {}) as { h?: string; v?: string };
  if (typeof args.w === "number" && sizing.h !== "hug") style.width = args.w;
  if (typeof args.h === "number" && sizing.v !== "hug") style.height = args.h;
  if (typeof args.stroke === "string") {
    style.border = `${Number(args.strokeWeight ?? 1)}px solid ${args.stroke}`;
  }
  if (args.type === "ellipse") style.borderRadius = "50%";
  if (args.type === "frame") {
    const layout = (args.layout ?? {}) as Record<string, unknown>;
    style.display = "flex";
    style.flexDirection = layout.direction === "vertical" ? "column" : "row";
    style.gap = Number(layout.gap ?? 0);
    style.padding = padding(layout.padding);
    style.justifyContent = ALIGN[String(layout.align)] ?? "flex-start";
    style.alignItems = ALIGN[String(layout.counterAlign)] as CSSProperties["alignItems"];
    style.flexWrap = layout.wrap ? "wrap" : "nowrap";
    style.overflow = args.clipsContent ? "hidden" : undefined;
  }
  if (args.type === "text") {
    style.fontFamily = String(args.fontFamily ?? "Inter");
    style.fontSize = Number(args.fontSize ?? 12);
    style.fontWeight = Number(args.fontWeight ?? 400);
    style.color = typeof args.color === "string" ? args.color : undefined;
    style.lineHeight = typeof args.lineHeight === "number" ? args.lineHeight : 1.2;
    style.whiteSpace = typeof args.w === "number" ? "normal" : "pre";
    style.background = undefined;
  }
  return style;
}
