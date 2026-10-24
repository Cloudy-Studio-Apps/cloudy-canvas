import { cssColor } from "../css-color";
import { draftShades } from "../shade-drafts";
import { useBoard } from "../use-board";
import type { ShadeStripsProps } from "./generator.types";

/** The shades as a strip per mode, as they'll be written. */
export function ShadeStrips({ draft }: ShadeStripsProps) {
  const { store, modes } = useBoard();
  const { colors } = draftShades(store, draft, modes, modes);
  return (
    <div className="flex flex-col gap-1">
      {modes.map((mode, m) => (
        <div key={mode.id}>
          {modes.length > 1 && (
            <span className="text-[11px] text-subtle-foreground">{mode.name}</span>
          )}
          <div className="flex h-7 overflow-hidden rounded-md border border-border">
            {colors.map((perMode, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: cssColor(perMode[m] ?? "#00000000") }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
