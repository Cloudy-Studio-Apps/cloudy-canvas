import { cn } from "@shared/ui/kit";
import type { LinkArrowProps } from "./link-path.types";

/** One link: the curve, a square origin on the layer and a filled head on the target screen. */
export function LinkArrow({ path, dashed, active }: LinkArrowProps) {
  const { origin, end, angle } = path;
  return (
    <g className="text-primary">
      <path
        d={path.d}
        fill="none"
        className={cn("stroke-primary", active ? "opacity-100" : "opacity-85")}
        strokeWidth={active ? 2.5 : 1.75}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <path
        d="M -7 -4 L 0 0 L -7 4 z"
        className="fill-primary"
        transform={`translate(${end.x} ${end.y}) rotate(${angle})`}
      />
      <rect
        x={origin.x - 3}
        y={origin.y - 3}
        width={6}
        height={6}
        className="fill-surface stroke-primary"
        strokeWidth={1.75}
      />
    </g>
  );
}
