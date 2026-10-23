import { useEffect, useId, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { imageQuad, type Point } from "@canvas";

import { normalizedToScreen, screenToLocal, useViewMapping } from "../../overlay";
import { dragCrop } from "./crop-drag";
import { CROP_EDGES, edgePoint } from "./crop-edges";
import type { CropGrip, ImageCropOverlayProps, ImageCropValue } from "./image-crop-overlay.types";

const GRIP = 8;

function polygon(points: readonly Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Crops a picture on the canvas, like Figma's crop mode: the whole picture shows dimmed past the
 * element's box; dragging it moves it, its corners scale it (Alt: round its middle) and the box's
 * sides and corners resize the element while the picture stays (Shift keeps the proportions).
 * Enter or Esc finishes.
 */
export function ImageCropOverlay({
  frame,
  transform,
  url,
  resizable = true,
  clamp = false,
  onChange,
  onDone,
}: ImageCropOverlayProps) {
  const view = useViewMapping();
  const svg = useRef<SVGSVGElement>(null);
  const clipId = useId();

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== "Escape") return;
      // Typing in a field (a panel's) keeps its keys.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      event.stopPropagation();
      onDone();
    };
    window.addEventListener("keydown", keyDown, { capture: true });
    return () => window.removeEventListener("keydown", keyDown, { capture: true });
  }, [onDone]);

  const screen = (p: Point) => normalizedToScreen(p, frame, view);
  const quad = imageQuad(transform).map(screen);
  const box = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map(screen);
  const [q0, q1, , q3] = quad as [Point, Point, Point, Point];
  const matrix = `matrix(${q1.x - q0.x} ${q1.y - q0.y} ${q3.x - q0.x} ${q3.y - q0.y} ${q0.x} ${q0.y})`;

  const startDrag = (event: ReactPointerEvent<SVGElement>, grip: CropGrip) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    const start: ImageCropValue = { frame, transform };
    const local = (e: { clientX: number; clientY: number }) => {
      const rect = svg.current?.getBoundingClientRect();
      const p = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
      return screenToLocal(p, start.frame, view);
    };
    const from = local(event);
    let first = true;
    const move = (e: PointerEvent) => {
      const next = dragCrop(grip, {
        start,
        from,
        to: local(e),
        keepRatio: e.shiftKey,
        fromCenter: e.altKey,
        clamp,
      });
      if (!next) return;
      onChange(next, first);
      first = false;
    };
    const end = () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
  };

  return (
    <svg ref={svg} className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <defs>
        <clipPath id={clipId}>
          {/* Everything but the box: the picture past it shows dimmed. */}
          <path
            clipRule="evenodd"
            d={`M-100000,-100000H100000V100000H-100000Z M${polygon(box).replaceAll(" ", " L")}Z`}
          />
        </clipPath>
      </defs>
      {url && (
        <image
          href={url}
          width={1}
          height={1}
          preserveAspectRatio="none"
          transform={matrix}
          opacity={0.4}
          clipPath={`url(#${clipId})`}
        />
      )}
      <polygon
        role="button"
        aria-label="Move the picture"
        points={polygon(quad)}
        fill="transparent"
        className="pointer-events-auto cursor-move stroke-primary"
        strokeWidth={1}
        strokeDasharray="4 3"
        onPointerDown={(e) => startDrag(e, { kind: "pan" })}
      />
      <polygon points={polygon(box)} fill="none" className="stroke-primary" strokeWidth={1.5} />
      {quad.map((p, corner) => (
        <circle
          key={`corner-${corner}`}
          role="button"
          aria-label="Scale the picture"
          cx={p.x}
          cy={p.y}
          r={GRIP / 2 + 1}
          className="pointer-events-auto cursor-nwse-resize fill-surface stroke-primary"
          strokeWidth={1.5}
          onPointerDown={(e) => startDrag(e, { kind: "zoom", corner })}
        />
      ))}
      {resizable &&
        CROP_EDGES.map(({ edge, cursor }) => {
          const at = screen(edgePoint(edge));
          return (
            <rect
              key={`${edge.x},${edge.y}`}
              role="button"
              aria-label="Resize the crop"
              x={at.x - GRIP / 2}
              y={at.y - GRIP / 2}
              width={GRIP}
              height={GRIP}
              style={{ cursor }}
              className="pointer-events-auto fill-surface stroke-primary"
              strokeWidth={1.5}
              onPointerDown={(e) => startDrag(e, { kind: "edge", edge })}
            />
          );
        })}
    </svg>
  );
}
