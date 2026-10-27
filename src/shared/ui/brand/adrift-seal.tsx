import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { AdriftSealProps } from "./adrift-seal.types";

// The mascot for when something broke: the "foca watona" dizzy on a cracked ice floe, bobbing in
// the water while a broken-off chunk drifts away. The seal is HoppingSeal's, scaled up.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [24, 27, 1.6, 1.1],
  [31, 24, 1.2, 0.8],
  [38.5, 25.5, 1.8, 1.2],
  [45, 31, 1.3, 1],
  [19, 33, 1.2, 0.9],
  [42, 45, 1.4, 1],
  [22, 46, 1, 0.8],
];
const INK = 1.6;
const WAVE = "q20 -6 40 0" + " t40 0".repeat(9);
const SWIRL = "a2.6 2.6 0 1 1 -2.6 -2.6 a1.6 1.6 0 1 1 -1.6 1.6 a0.6 0.6 0 1 1 0.6 0.6";
const STAR = (x: number, y: number, r: number) =>
  `M${x} ${y}l${r * 0.4} ${r * 0.84} ${r * 0.92} ${r * 0.12} ${-r * 0.68} ${r * 0.64} ${r * 0.16} ${r * 0.92} ${-r * 0.8} ${-r * 0.44} ${-r * 0.8} ${r * 0.44} ${r * 0.16} ${-r * 0.92} ${-r * 0.68} ${-r * 0.64} ${r * 0.92} ${-r * 0.12}z`;
// Rotations around a point in the scene, not around each shape.
const VIEW_BOX = "[transform-box:view-box]";
const OWN_BOX = "[transform-box:fill-box]";

export function AdriftSeal({ width = 320, className }: AdriftSealProps) {
  const id = useId();
  const furId = `${id}-fur`;
  const seaId = `${id}-sea`;

  return (
    <svg
      viewBox="0 0 320 210"
      width={width}
      height={(width * 210) / 320}
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
        <clipPath id={seaId}>
          <rect x="0" y="150" width="320" height="60" />
        </clipPath>
      </defs>

      {/* Water */}
      <g clipPath={`url(#${seaId})`}>
        <rect x="0" y="160" width="320" height="50" className="fill-ice-200" />
        <path
          d={`M0 178 ${WAVE} V210 H0 Z`}
          className="animate-seal-waves fill-ice-300 [animation-direction:reverse] [animation-duration:7s]"
          opacity={0.6}
        />
        <path
          d={`M0 162 ${WAVE}`}
          fill="none"
          strokeWidth={1.5}
          className="animate-seal-waves stroke-ice-300"
        />
      </g>

      {/* The broken-off chunk, drifting away */}
      <g className={cn("origin-[262px_162px] animate-seal-drift", VIEW_BOX)}>
        <path
          d="M244 160 L252 150 L276 152 L282 162 L262 170 Z"
          strokeWidth={1.5}
          className="fill-ice-50 stroke-ice-300"
        />
        <path
          d="M252 150 L258 160 L262 170"
          fill="none"
          strokeWidth={1}
          className="stroke-ice-300"
          opacity={0.7}
        />
      </g>

      <g className={cn("origin-[160px_150px] animate-seal-bob", VIEW_BOX)}>
        {/* The floe, cracked where the chunk broke off */}
        <path
          d="M82 160 L92 146 L226 144 L234 154 L222 168 L96 170 Z"
          strokeWidth={1.5}
          className="fill-ice-50 stroke-ice-300"
        />
        <path
          d="M226 144 L214 152 L222 158 L210 166"
          fill="none"
          strokeWidth={1.5}
          className="stroke-ice-300"
        />
        <path d="M110 151 L150 150" fill="none" className="stroke-ice-300" opacity={0.6} />
        <ellipse cx="160" cy="148" rx="34" ry="4" className="fill-seal-900" opacity={0.14} />

        <g transform="translate(108 46) scale(1.62)">
          {/* Tail flippers, behind the body */}
          <ellipse
            cx="26"
            cy="58"
            rx="5"
            ry="2.4"
            transform="rotate(-20 26 58)"
            className="fill-seal-300 stroke-seal-900"
            strokeWidth={INK}
          />
          <ellipse
            cx="38"
            cy="58"
            rx="5"
            ry="2.4"
            transform="rotate(20 38 58)"
            className="fill-seal-300 stroke-seal-900"
            strokeWidth={INK}
          />

          {/* Plump body */}
          <ellipse
            cx="32"
            cy="39"
            rx="20"
            ry="18"
            fill={`url(#${furId})`}
            className="stroke-seal-900"
            strokeWidth={INK}
          />
          {SPOTS.map(([cx, cy, rx, ry]) => (
            <ellipse
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              className="fill-seal-400"
            />
          ))}

          {/* Front flippers, holding on */}
          <g transform="rotate(-35 15 48)">
            <ellipse
              cx="15"
              cy="48"
              rx="5.5"
              ry="2.6"
              className={cn(
                "origin-right animate-seal-flap fill-seal-200 stroke-seal-900",
                OWN_BOX,
              )}
              strokeWidth={INK}
            />
          </g>
          <g transform="rotate(35 49 48)">
            <ellipse
              cx="49"
              cy="48"
              rx="5.5"
              ry="2.6"
              className={cn(
                "origin-left animate-seal-flap fill-seal-200 stroke-seal-900 [--seal-swing:14deg]",
                OWN_BOX,
              )}
              strokeWidth={INK}
            />
          </g>

          {/* Blush cheeks */}
          <ellipse cx="19.5" cy="37" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />
          <ellipse cx="44.5" cy="37" rx="3" ry="1.8" className="fill-blush-300" opacity={0.8} />

          {/* Dizzy swirl eyes */}
          {[25, 42.2].map((x) => (
            <path
              key={x}
              d={`M${x} 32.5 ${SWIRL}`}
              fill="none"
              strokeWidth={1.2}
              className={cn("origin-center animate-seal-dizzy stroke-seal-900", OWN_BOX)}
            />
          ))}

          {/* Puffy muzzle, nose and a wobbly mouth */}
          <path
            d="M32 37.2c-1-1.6-5.6-1.6-6 1.4-.3 2.4 2.6 3.4 4.4 2.6.8-.3 1.3-.8 1.6-1.3.3.5.8 1 1.6 1.3 1.8.8 4.7-.2 4.4-2.6-.4-3-5-3-6-1.4z"
            className="fill-seal-50 stroke-seal-900"
            strokeWidth={INK * 0.8}
          />
          <ellipse cx="32" cy="36.9" rx="1.7" ry="1.15" className="fill-seal-900" />
          <path
            d="M29.5 43.6q1.25 -1 2.5 0t2.5 0"
            fill="none"
            strokeWidth={1}
            className="stroke-seal-900"
          />

          {/* Sweat drop */}
          <path
            d="M50 24q2 3 0 4.4q-2 -1.4 0 -4.4z"
            strokeWidth={0.8}
            className="animate-seal-drop fill-ice-300 stroke-seal-900"
          />
        </g>

        {/* Stars circling its head */}
        <g className={cn("origin-[160px_62px] animate-seal-orbit", VIEW_BOX)} strokeWidth={1.1}>
          <path d={STAR(160, 34, 5)} className="fill-blush-300 stroke-seal-900" />
          <path d={STAR(196, 70, 3.7)} className="fill-ice-300 stroke-seal-900" />
          <path d={STAR(124, 74, 3.3)} className="fill-blush-300 stroke-seal-900" />
        </g>
      </g>
    </svg>
  );
}
