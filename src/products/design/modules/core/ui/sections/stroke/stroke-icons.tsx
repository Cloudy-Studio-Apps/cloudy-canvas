import type { CapIconProps, JoinIconProps } from "./stroke-icons.types";

// Small drawn previews of stroke ends and corners for the settings' option buttons.

const CAP_ENDS: Record<CapIconProps["cap"], string> = {
  none: "M3 5h7v6H3",
  round: "M3 5h7a3 3 0 0 1 0 6H3",
  square: "M3 5h10v6H3",
};

/** A thick stroke's end, with the point it ends at. */
export function CapIcon({ cap }: CapIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={CAP_ENDS[cap]} fill="currentColor" opacity={0.35} />
      <path d="M3 8h7" stroke="currentColor" strokeWidth={1.25} />
      <circle cx={10} cy={8} r={1.25} fill="currentColor" />
    </svg>
  );
}

/** A thick corner turned as `join` turns it. */
export function JoinIcon({ join }: JoinIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 13V5h8"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinejoin={join}
        opacity={0.35}
      />
      <path d="M3 13V5h8" stroke="currentColor" strokeWidth={1} strokeLinejoin="miter" />
    </svg>
  );
}
