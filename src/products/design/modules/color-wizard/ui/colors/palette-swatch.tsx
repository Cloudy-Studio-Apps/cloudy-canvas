import { Copy, Lock, LockOpen, Pipette, Trash2 } from "lucide-react";

import { ColorPopover, CommitInput } from "@canvas-ui";
import { cn, IconButton } from "@shared/ui/kit";
import { colorOklch, normalizeColorHex, onColor, simulateCvd } from "../..";
import { copyText } from "../copy-text";
import { MAX_COLORS, removeColor, setColorAt, toggleLock, useColorWizardStore } from "../store";
import type { PaletteSwatchProps } from "./colors.types";
import { InsertSeam } from "./insert-seam";

const TOOL = "text-current opacity-80 hover:bg-current/15 hover:text-current hover:opacity-100";

/** One color of the palette as a tall column: its tools on hover, its role, hex and numbers. */
export function PaletteSwatch({ color, index, count }: PaletteSwatchProps) {
  const cvd = useColorWizardStore((s) => s.cvd);
  const shown = simulateCvd(color.hex, cvd);
  const ink = onColor(shown);
  const { L, C, h } = colorOklch(color.hex);
  return (
    <div
      className="group/swatch relative flex min-w-0 flex-1 flex-col justify-end gap-0.5 p-2.5 @max-[420px]:flex-row @max-[420px]:items-center @max-[420px]:justify-between @max-[420px]:py-1.5"
      style={{ background: shown, color: ink }}
    >
      {index > 0 && count < MAX_COLORS && <InsertSeam at={index} />}
      <div
        className={cn(
          "absolute top-2 left-1/2 flex -translate-x-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover/swatch:opacity-100 focus-within:opacity-100 @max-[420px]:static @max-[420px]:order-2 @max-[420px]:translate-x-0 @max-[420px]:flex-row @max-[420px]:opacity-100",
          color.locked && "opacity-100",
        )}
      >
        <IconButton
          label={color.locked ? "Unlock" : "Lock: keep it when generating"}
          size="sm"
          className={TOOL}
          onClick={() => toggleLock(index)}
        >
          {color.locked ? <Lock /> : <LockOpen />}
        </IconButton>
        <IconButton
          label="Copy hex"
          size="sm"
          className={TOOL}
          onClick={() => copyText(color.hex, color.hex)}
        >
          <Copy />
        </IconButton>
        <ColorPopover
          color={color.hex.toLowerCase()}
          label={`color ${index + 1}`}
          onChange={(next, info) => info.done && setColorAt(index, next.color.toUpperCase())}
          trigger={
            <IconButton label="Edit color" size="sm" className={TOOL}>
              <Pipette />
            </IconButton>
          }
        />
        {count > 2 && (
          <IconButton label="Remove" size="sm" className={TOOL} onClick={() => removeColor(index)}>
            <Trash2 />
          </IconButton>
        )}
      </div>
      {color.name && (
        <span className="text-[11px] font-semibold opacity-85 @max-[420px]:hidden">
          {color.name}
        </span>
      )}
      <CommitInput
        value={color.hex}
        aria-label={`Color ${index + 1}`}
        spellCheck={false}
        className="-mx-1 w-full rounded-sm border-0 bg-transparent px-1 py-0.5 text-sm font-semibold tracking-wide text-current uppercase outline-none hover:bg-current/10 focus:bg-current/10 focus:ring-2 focus:ring-current @max-[420px]:w-24"
        onCommit={(text) => {
          const hex = normalizeColorHex(text);
          if (!hex) return "Not a color: use #RRGGBB";
          setColorAt(index, hex);
        }}
      />
      <div className="flex justify-between gap-1 text-[11px] opacity-75 @max-[420px]:hidden">
        <span>
          L {Math.round(L * 100)} · C {C.toFixed(2)} · H {Math.round(h)}
        </span>
      </div>
    </div>
  );
}
