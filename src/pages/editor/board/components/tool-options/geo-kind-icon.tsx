import type { GeoKind } from "@engine";
import type { GeoKindIconProps } from "./geo-kind-icon.types";

/** SVG outline for each shape kind, drawn in the current text color. */
const PATHS: Record<GeoKind, string> = {
  rectangle: "M3 5h14v10H3z",
  rounded: "M5 5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  ellipse: "M10 3a7 7 0 1 0 0 14a7 7 0 1 0 0-14z",
  diamond: "M10 2.5l7.5 7.5L10 17.5L2.5 10z",
  triangle: "M10 3l7.5 13.5h-15z",
  parallelogram: "M6 5h12l-4 10H2z",
  cylinder:
    "M3 5.5c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5v9c0 1.4-3.1 2.5-7 2.5s-7-1.1-7-2.5zM3 5.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5",
  star: "M10 2.5l2.2 4.6l5 .7l-3.6 3.5l.9 5L10 13.9l-4.5 2.4l.9-5l-3.6-3.5l5-.7z",
};

export function GeoKindIcon({ kind, className }: GeoKindIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden
      className={className ?? "size-5"}
    >
      <path d={PATHS[kind]} />
    </svg>
  );
}
