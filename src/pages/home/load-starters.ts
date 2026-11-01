import { boardStarters } from "@board/modules/core/ui";
import { getBoardModules } from "@board/ui";
import { designStarters } from "@design/modules/core/ui";
import { getDesignModules } from "@design/ui";
import type { HomeStarter } from "./use-starters.types";

/** Every product's starters, boards first, each product's in its modules' `order`. */
export function loadStarters(): HomeStarter[] {
  const board = [...getBoardModules().get(boardStarters)].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const design = [...getDesignModules().get(designStarters)].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  return [
    ...board.map((starter) => ({ ...starter, type: "board" as const })),
    ...design.map((starter) => ({ ...starter, type: "design" as const })),
  ];
}
