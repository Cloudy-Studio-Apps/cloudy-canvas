import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { HoppingSealProps } from "./hopping-seal.types";

// The mascot for waiting: the whole "foca watona" (chubby spotted seal), hopping in place. It
// squashes as it lands and stretches as it takes off, and its shadow shrinks while it's up.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [24, 21, 1.6, 1.1],
  [31, 18, 1.2, 0.8],
  [38.5, 19.5, 1.8, 1.2],
  [45, 25, 1.3, 1],
  [19, 27, 1.2, 0.9],
  [42, 39, 1.4, 1],
  [22, 40, 1, 0.8],
];
const INK = 1.6;

export function HoppingSeal({ size = 72, className }: HoppingSealProps) {
  const furId = `${useId()}-fur`;

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

      <ellipse
        cx="32"
        cy="58"
        rx="15"
        ry="2.5"
        className="origin-center animate-seal-shadow fill-seal-900 [transform-box:fill-box]"
        opacity={0.18}
      />

      <g className="origin-bottom animate-seal-hop [transform-box:fill-box]">
        {/* Tail flippers, behind the body */}
        <ellipse
          cx="26"
          cy="52"
          rx="5"
          ry="2.4"
          transform="rotate(-20 26 52)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />
        <ellipse
          cx="38"
          cy="52"
          rx="5"
          ry="2.4"
          transform="rotate(20 38 52)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />

        {/* Plump body */}
        <ellipse
          cx="32"
          cy="33"
          rx="20"
          ry="18"
          fill={`url(#${furId})`}
          className="stroke-seal-900"
          strokeWidth={INK}
        />
        {SPOTS.map(([cx, cy, rx, ry]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="fill-seal-400" />
        ))}

        {/* Front flippers */}
        <ellipse
          cx="15"
          cy="42"
          rx="5.5"
          ry="2.6"
          transform="rotate(-35 15 42)"
          className="fill-seal-200 stroke-seal-900"
          strokeWidth={INK}
        />
        <ellipse
          cx="49"
          cy="42"
          rx="5.5"
          ry="2.6"
          transform="rotate(35 49 42)"
          className="fill-seal-200 stroke-seal-900"
          strokeWidth={INK}
        />

        {/* Blush cheeks */}
        <ellipse cx="19.5" cy="31" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />
        <ellipse cx="44.5" cy="31" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />

        {/* Happy closed eyes */}
        <path
          d="M21.5 27.5q3-3 6 0M36.5 27.5q3-3 6 0"
          fill="none"
          className="stroke-seal-900"
          strokeWidth={INK}
        />

        {/* Puffy muzzle, nose and ω mouth */}
        <path
          d="M32 31.2c-1-1.6-5.6-1.6-6 1.4-.3 2.4 2.6 3.4 4.4 2.6.8-.3 1.3-.8 1.6-1.3.3.5.8 1 1.6 1.3 1.8.8 4.7-.2 4.4-2.6-.4-3-5-3-6-1.4z"
          className="fill-seal-50 stroke-seal-900"
          strokeWidth={INK * 0.8}
        />
        <ellipse cx="32" cy="30.9" rx="1.7" ry="1.15" className="fill-seal-900" />
      </g>
    </svg>
  );
}
