import { cn } from "@shared/ui/lib/utils";
import type { BookPageProps } from "./preview.types";
import { SidePicture } from "./side-picture";

/** Each side's page edges and the shade near the spine. */
const SIDES = {
  left: {
    edges: "shadow-[-2px_2px_0_var(--color-border),-4px_4px_0_var(--color-border-strong)]",
    shade: "bg-linear-to-l from-foreground/25 via-transparent via-12% to-transparent",
  },
  right: {
    edges: "shadow-[2px_2px_0_var(--color-border),4px_4px_0_var(--color-border-strong)]",
    shade: "bg-linear-to-r from-foreground/20 via-transparent via-10% to-transparent",
  },
  single: {
    edges: "shadow-[2px_2px_0_var(--color-border),4px_4px_0_var(--color-border-strong)]",
    shade: "bg-linear-to-r from-foreground/12 via-transparent via-5% to-transparent",
  },
} as const;

/** A side lying open in the 3D booklet; an empty side shows nothing. */
export function BookPage({ side, position, left, width, height }: BookPageProps) {
  if (!side) return null;
  const { edges, shade } = SIDES[position];
  return (
    <div className={cn("absolute top-0", edges)} style={{ left }}>
      <SidePicture side={side} width={width} height={height} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", shade)} />
    </div>
  );
}
