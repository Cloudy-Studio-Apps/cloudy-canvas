import type { GeoKindIconProps } from "./geo-kind-icon.types";

/** A geo variant's outline icon, drawn in the current text color. */
export function GeoKindIcon({ path, className }: GeoKindIconProps) {
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
      <path d={path} />
    </svg>
  );
}
