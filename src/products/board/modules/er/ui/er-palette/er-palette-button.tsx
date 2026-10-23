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
  blocked,
  shortcut,
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
        description={blocked ? `${clickLabel}.` : `${item.description} Click: ${clickLabel}.`}
        side="right"
        {...(shortcut ? { shortcut } : {})}
        active={ghost !== null}
        className={
          blocked
            ? "cursor-not-allowed opacity-40"
            : clickDisabled
              ? "text-muted-foreground"
              : undefined
        }
        // Not `disabled`: a disabled button shows no tooltip, and the tooltip gives the reason.
        aria-disabled={blocked}
        onPointerDown={blocked ? undefined : onPointerDown}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !clickDisabled && !blocked) {
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
