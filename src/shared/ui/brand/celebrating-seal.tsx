import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { CelebratingSealProps } from "./celebrating-seal.types";

// The mascot when something's done: the whole "foca watona" hopping (as `HoppingSeal`) with its
// front flippers up and waving, an open smile, and sparkles twinkling around it.
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

/** A four-pointed star centered on (x, y), `r` from its middle to a tip. */
function sparklePath(x: number, y: number, r: number): string {
  const k = r * 0.3;
  return (
    `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}` +
    `L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`
  );
}

const SPARKLES: [x: number, y: number, r: number, className: string, delay: string][] = [
  [2, 6, 3.5, "fill-sand-400", "0s"],
  [62, 2, 3, "fill-ice-400", "0.3s"],
  [66, 30, 2.4, "fill-blush-400", "0.6s"],
  [-2, 34, 2.2, "fill-ice-400", "0.9s"],
];

export function CelebratingSeal({ size = 128, className }: CelebratingSealProps) {
  const furId = `${useId()}-fur`;

  return (
    <svg
      viewBox="-8 -10 80 76"
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

      {SPARKLES.map(([x, y, r, fill, delay]) => (
        <path
          key={`${x}-${y}`}
          d={sparklePath(x, y, r)}
          className={cn("origin-center animate-seal-sparkle [transform-box:fill-box]", fill)}
          style={{ animationDelay: delay }}
        />
      ))}

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

        {/* Front flippers, raised and waving one after the other */}
        <g className="origin-bottom-right animate-seal-wave [transform-box:fill-box]">
          <ellipse
            cx="11"
            cy="27"
            rx="6"
            ry="2.7"
            transform="rotate(-55 11 27)"
            className="fill-seal-200 stroke-seal-900"
            strokeWidth={INK}
          />
        </g>
        <g
          className="origin-bottom-left animate-seal-wave [transform-box:fill-box]"
          style={{ animationDelay: "0.22s" }}
        >
          <ellipse
            cx="53"
            cy="27"
            rx="6"
            ry="2.7"
            transform="rotate(55 53 27)"
            className="fill-seal-200 stroke-seal-900"
            strokeWidth={INK}
          />
        </g>

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

        {/* Blush cheeks */}
        <ellipse cx="19.5" cy="31" rx="3.2" ry="2" className="fill-blush-300" opacity={0.9} />
        <ellipse cx="44.5" cy="31" rx="3.2" ry="2" className="fill-blush-300" opacity={0.9} />

        {/* Happy closed eyes */}
        <path
          d="M21.5 27.5q3-3.4 6 0M36.5 27.5q3-3.4 6 0"
          fill="none"
          className="stroke-seal-900"
          strokeWidth={INK}
        />

        {/* Puffy muzzle, nose and an open smile */}
        <path
          d="M32 31.2c-1-1.6-5.6-1.6-6 1.4-.3 2.4 2.6 3.4 4.4 2.6.8-.3 1.3-.8 1.6-1.3.3.5.8 1 1.6 1.3 1.8.8 4.7-.2 4.4-2.6-.4-3-5-3-6-1.4z"
          className="fill-seal-50 stroke-seal-900"
          strokeWidth={INK * 0.8}
        />
        <ellipse cx="32" cy="30.9" rx="1.7" ry="1.15" className="fill-seal-900" />
        <path
          d="M29.6 35.6q2.4 3.4 4.8 0z"
          className="fill-blush-500 stroke-seal-900"
          strokeWidth={INK * 0.7}
        />
      </g>
    </svg>
  );
}
