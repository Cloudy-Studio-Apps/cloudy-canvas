import { ToolButton } from "@canvas-ui";
import { ErDragGhostChip } from "./er-drag-ghost";
import { ErPaletteIcon } from "./er-palette-icon";
import type { ErPaletteButtonProps } from "./er-palette.types";
import { usePaletteDrag } from "./use-palette-drag";

/** One ER element type: click adds it next to the selection, dragging drops it on the board. */
export function ErPaletteButton({
  item,
  diagram,
  clickLabel,
  clickDisabled,
  onClick,
}: ErPaletteButtonProps) {
  const { onPointerDown, ghost } = usePaletteDrag({
    item: item.id,
    diagram,
    onClick: () => {
      if (!clickDisabled) onClick();
    },
  });

  return (
    <>
      <ToolButton
        label={item.label}
        description={`${item.description} Click: ${clickLabel}.`}
        side="right"
        active={ghost !== null}
        className={clickDisabled ? "text-muted-foreground" : undefined}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !clickDisabled) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        <ErPaletteIcon id={item.id} />
      </ToolButton>
      {ghost && <ErDragGhostChip item={item.id} ghost={ghost} />}
    </>
  );
}
