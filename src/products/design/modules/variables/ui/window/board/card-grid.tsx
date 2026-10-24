import type { CardGridProps } from "./card-grid.types";

/** The board's cards in as many columns as fit. */
export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(116px,1fr))] gap-2.5">{children}</div>
  );
}
