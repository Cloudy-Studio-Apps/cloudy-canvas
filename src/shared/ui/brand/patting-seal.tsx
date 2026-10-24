import { useId, type CSSProperties } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { PattingSealProps } from "./patting-seal.types";

// The mascot saying hello: the "foca watona" sitting up and patting its belly like a drum, one
// flipper then the other. The belly squishes on each pat, little marks pop out beside it, and the
// body sways towards the flipper that pats. Same drawing style as `HoppingSeal`.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [24, 13.5, 1.3, 0.9],
  [39, 12.5, 1.1, 0.8],
  [19, 34, 1.2, 0.9],
  [45, 37, 1.4, 1],
  [20.5, 49, 1, 0.8],
  [43, 51, 1.2, 0.9],
];
const INK = 1.6;
const BODY =
  "M32 8C40 8 45 14 45 21C45 26 43.5 28.5 44.5 31.5C48.5 36.5 49.5 44 47.5 50C45.5 56 39.5 58 32 58C24.5 58 18.5 56 16.5 50C14.5 44 15.5 36.5 19.5 31.5C20.5 28.5 19 26 19 21C19 14 24 8 32 8Z";

/** A part turning round a point of the drawing (CSS transforms on SVG, in its own units). */
function pivot(x: number, y: number, extra?: CSSProperties): CSSProperties {
  return { transformBox: "view-box", transformOrigin: `${x}px ${y}px`, ...extra };
}

export function PattingSeal({ size = 88, className }: PattingSealProps) {
  const furId = `${useId()}-fur`;
  const half = { animationDelay: "-0.6s" };

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={furId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--seal-300)" }} />
          <stop offset="80%" style={{ stopColor: "var(--seal-100)" }} />
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="59" rx="15" ry="2.5" className="fill-seal-900" opacity={0.15} />

      {/* "Pat!" marks, beside the side being patted */}
      <path
        d="M12.5 40.5l-3-1.5M11.5 45h-3.5M12.5 49.5l-3 1.5"
        fill="none"
        className="animate-seal-pat-marks stroke-seal-500"
        strokeWidth={INK * 0.8}
      />
      <path
        d="M51.5 40.5l3-1.5M52.5 45h3.5M51.5 49.5l3 1.5"
        fill="none"
        className="animate-seal-pat-marks stroke-seal-500"
        style={half}
        strokeWidth={INK * 0.8}
      />

      <g className="animate-seal-sway" style={pivot(32, 58)}>
        {/* Tail flippers, behind the body */}
        <ellipse
          cx="24.5"
          cy="56.5"
          rx="5"
          ry="2.3"
          transform="rotate(-15 24.5 56.5)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />
        <ellipse
          cx="39.5"
          cy="56.5"
          rx="5"
          ry="2.3"
          transform="rotate(15 39.5 56.5)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />

        {/* Chubby body, sitting up */}
        <path d={BODY} fill={`url(#${furId})`} className="stroke-seal-900" strokeWidth={INK} />
        {SPOTS.map(([cx, cy, rx, ry]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="fill-seal-400" />
        ))}

        {/* The drum: a pale belly that squishes on every pat */}
        <ellipse
          cx="32"
          cy="45"
          rx="9.5"
          ry="9"
          className="animate-seal-belly fill-seal-50"
          style={pivot(32, 54)}
          opacity={0.9}
        />

        {/* Face */}
        <ellipse cx="23.5" cy="23.5" rx="2.8" ry="1.7" className="fill-blush-300" opacity={0.8} />
        <ellipse cx="40.5" cy="23.5" rx="2.8" ry="1.7" className="fill-blush-300" opacity={0.8} />
        <path
          d="M24.5 19.5q2.7-2.7 5.4 0M34.1 19.5q2.7-2.7 5.4 0"
          fill="none"
          className="stroke-seal-900"
          strokeWidth={INK}
        />
        <g transform="translate(0 -8)">
          <path
            d="M32 31.2c-1-1.6-5.6-1.6-6 1.4-.3 2.4 2.6 3.4 4.4 2.6.8-.3 1.3-.8 1.6-1.3.3.5.8 1 1.6 1.3 1.8.8 4.7-.2 4.4-2.6-.4-3-5-3-6-1.4z"
            className="fill-seal-50 stroke-seal-900"
            strokeWidth={INK * 0.8}
          />
          <ellipse cx="32" cy="30.9" rx="1.7" ry="1.15" className="fill-seal-900" />
        </g>

        {/* Front flippers: lifted off, then down on the belly (the group turns, the shape tilts) */}
        <g
          className="animate-seal-pat"
          style={pivot(20, 36, { "--seal-swing": "38deg" } as CSSProperties)}
        >
          <ellipse
            cx="25"
            cy="43"
            rx="6.5"
            ry="2.7"
            transform="rotate(50 25 43)"
            className="fill-seal-200 stroke-seal-900"
            strokeWidth={INK}
          />
        </g>
        <g
          className="animate-seal-pat"
          style={pivot(44, 36, { "--seal-swing": "-38deg", ...half } as CSSProperties)}
        >
          <ellipse
            cx="39"
            cy="43"
            rx="6.5"
            ry="2.7"
            transform="rotate(-50 39 43)"
            className="fill-seal-200 stroke-seal-900"
            strokeWidth={INK}
          />
        </g>
      </g>
    </svg>
  );
}
