import { joinTokenColor, resolveVariable, splitTokenColor } from "@canvas";
import { ColorPopover, CommitTextarea, TokenSwatch, useDocumentTokens } from "@canvas-ui";
import { colorMode } from "./color-mode";
import type { ColorValuePopoverProps } from "./colors-ui.types";

/**
 * A board color's swatch, which opens the color picker on its value in the mode the board shows
 * (an alias picked over becomes a color of its own; a drag is one undo step) and its description
 * (what it's for, as agents and exports read it).
 */
export function ColorValuePopover({ variable }: ColorValuePopoverProps) {
  const { tokens, store } = useDocumentTokens();
  const resolved = resolveVariable(store, variable.id, {});
  const color = resolved?.type === "color" ? resolved.color : "#000000FF";
  const { hex, alpha } = splitTokenColor(color);
  const mode = colorMode(store, variable);
  return (
    <ColorPopover
      color={hex}
      opacity={alpha}
      label={variable.name}
      onChange={(next) =>
        tokens.setValue(variable.id, mode, { color: joinTokenColor(next.color, next.opacity) })
      }
      trigger={
        // eslint-disable-next-line no-restricted-syntax -- bespoke: the swatch is the trigger
        <button
          type="button"
          aria-label={`Edit ${variable.name}`}
          title="Edit color"
          className="shrink-0 rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <TokenSwatch color={color} className="size-5" />
        </button>
      }
    >
      <CommitTextarea
        aria-label={`${variable.name} description`}
        placeholder="What it's for"
        value={variable.description}
        onCommit={(description) => tokens.updateVariable(variable.id, { description })}
        className="min-h-14 resize-none text-xs"
      />
    </ColorPopover>
  );
}
