import { useId, type CSSProperties } from "react";

import { cn } from "@shared/ui/lib/utils";
import type { PaintingSealProps } from "./painting-seal.types";

// The variables window's mascot: the "foca watona" lying on its belly in a beret, a palette in one
// flipper and a brush behind its head. It breathes, the brush sweeps as if painting, the palette's
// dots light up one after another and its tail flippers wiggle.
// Brand art may use palette scales directly; UI components must use semantic tokens.

const INK = 1.6;
const SPOTS: [cx: number, cy: number, rx: number, ry: number][] = [
  [22, 36, 1.8, 1.2],
  [30, 30, 1.3, 0.9],
  [37, 40, 2, 1.3],
  [27, 44, 1.4, 1],
  [45, 31, 1.4, 1],
  [50, 42, 1.6, 1.1],
  [18, 44, 1.1, 0.8],
];
/** The palette's paint dots: [cx, cy, palette class]. */
const PAINTS: [cx: number, cy: number, className: string][] = [
  [57.5, 45.5, "fill-blush-500"],
  [60.5, 41.8, "fill-sand-500"],
  [64.8, 41.6, "fill-ice-500"],
  [58.6, 49.6, "fill-lilac-500"],
  [62.8, 50.6, "fill-seal-700"],
];

function pivot(x: number, y: number, extra?: CSSProperties): CSSProperties {
  return { transformBox: "view-box", transformOrigin: `${x}px ${y}px`, ...extra };
}

export function PaintingSeal({ width = 150, className }: PaintingSealProps) {
  const furId = `${useId()}-fur`;
  return (
    <svg
      viewBox="0 0 96 64"
      width={width}
      height={(width * 64) / 96}
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={furId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--seal-300)" }} />
          <stop offset="85%" style={{ stopColor: "var(--seal-100)" }} />
        </linearGradient>
      </defs>

      <ellipse cx="46" cy="59.5" rx="36" ry="2.6" className="fill-seal-900" opacity={0.12} />

      {/* Tail flippers, behind the body */}
      <g className="animate-seal-tail" style={pivot(14, 48)}>
        <ellipse
          cx="9"
          cy="44"
          rx="6.5"
          ry="2.6"
          transform="rotate(-25 9 44)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />
        <ellipse
          cx="9.5"
          cy="50"
          rx="6"
          ry="2.4"
          transform="rotate(12 9.5 50)"
          className="fill-seal-300 stroke-seal-900"
          strokeWidth={INK}
        />
      </g>

      <g className="animate-seal-breathe" style={pivot(46, 58)}>
        {/* Brush, behind the head */}
        <g className="animate-seal-brush" style={pivot(70, 36)}>
          <path d="M70 36L83 8" className="stroke-sand-600" strokeWidth={2.4} />
          <path d="M82.4 9.5l2.2-4.6" className="stroke-seal-400" strokeWidth={2.8} />
          <path
            d="M84.2 5.2c.6-1.8 1.8-3 2.6-3.7-.1 1.6-.6 3.4-1.6 4.6z"
            className="fill-ice-500 stroke-seal-900"
            strokeWidth={INK * 0.6}
          />
        </g>

        {/* Chubby body lying down, the head on the right */}
        <path
          d="M14 46c0-12 14-20 32-20 6 0 10-2 14-6 4-5 10-7 15-5 6 2 9 8 8 15-1 8-6 12-12 14 2 3 2 6-1 8H22c-5 0-8-3-8-6z"
          fill={`url(#${furId})`}
          className="stroke-seal-900"
          strokeWidth={INK}
        />
        <path d="M24 56c10 2 30 2 40 0" fill="none" className="stroke-seal-300" strokeWidth={INK} />
        {SPOTS.map(([cx, cy, rx, ry]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="fill-seal-400" />
        ))}

        {/* Face */}
        <ellipse cx="69" cy="29" rx="2.6" ry="1.6" className="fill-blush-300" opacity={0.8} />
        <ellipse cx="84" cy="28" rx="2.4" ry="1.5" className="fill-blush-300" opacity={0.8} />
        <path
          d="M70.5 24.5q2.4-2.4 4.8 0M79 24q2.4-2.4 4.8 0"
          fill="none"
          className="stroke-seal-900"
          strokeWidth={INK}
        />
        <path
          d="M77.3 28.4c-.9-1.4-5-1.4-5.4 1.2-.3 2.1 2.3 3 3.9 2.3.7-.3 1.1-.7 1.4-1.1.3.4.7.8 1.4 1.1 1.6.7 4.2-.2 3.9-2.3-.4-2.6-4.5-2.6-5.4-1.2z"
          className="fill-seal-50 stroke-seal-900"
          strokeWidth={INK * 0.8}
        />
        <ellipse cx="77.3" cy="28.1" rx="1.5" ry="1" className="fill-seal-900" />

        {/* Beret, tilted */}
        <path
          d="M64 17.5c1-6 12-8.5 20-5.5 3 1.2 3 4-.2 4.6-6 1.2-14 2.2-19.8.9z"
          className="fill-seal-900 stroke-seal-900"
          strokeWidth={INK}
        />
        <path d="M74 11.6l.8-2.4" className="stroke-seal-900" strokeWidth={2.2} />

        {/* Palette in a front flipper */}
        <path
          d="M54 46c0-5 5-8 10-7 5 1 7 6 4 10-1.6 2-3.6 1.6-5.2 2.6-2 1.4-4.2 1.4-6 .2-2.2-1.4-2.8-3.6-2.8-5.8z"
          className="fill-sand-100 stroke-seal-900"
          strokeWidth={INK}
        />
        <ellipse cx="66.5" cy="47.5" rx="1.6" ry="1.2" className="fill-sand-300" />
        {PAINTS.map(([cx, cy, paint], i) => (
          <circle
            key={paint}
            cx={cx}
            cy={cy}
            r={1.5}
            className={cn("animate-seal-twinkle", paint)}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
        <ellipse
          cx="66"
          cy="53"
          rx="4.5"
          ry="2.2"
          transform="rotate(-20 66 53)"
          className="fill-seal-200 stroke-seal-900"
          strokeWidth={INK}
        />
      </g>
    </svg>
  );
}
