import { ColorField } from "@canvas-ui";
import { joinTokenColor } from "@canvas";
import { draftBase } from "../shade-drafts";
import { useBoard } from "../use-board";
import type { GeneratorPartProps } from "./generator.types";

/** The shades' base: a variable's color (followed), or one picked here. */
export function BaseColorField({ draft, change }: GeneratorPartProps) {
  const { store } = useBoard();
  const base = draftBase(store, draft);
  const variable = draft.baseVar ? store.variable(draft.baseVar) : undefined;
  const hex = base.slice(0, 7);
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="flex justify-between text-muted-foreground">
        Base color
        {variable && <span className="text-subtle-foreground">from {variable.name}</span>}
      </span>
      {variable ? (
        <div className="flex h-7 items-center gap-2 rounded-md bg-surface-sunken px-2">
          <span
            className="size-4 rounded-xs border border-border"
            style={{ backgroundColor: hex }}
          />
          <span className="font-mono">{hex.toUpperCase()}</span>
          <button
            type="button"
            className="ml-auto text-primary hover:underline"
            onClick={() => change({ baseVar: null, baseColor: base })}
          >
            Use a fixed color
          </button>
        </div>
      ) : (
        <ColorField
          color={hex.toLowerCase()}
          label="Base color"
          onChange={(next) => change({ baseColor: joinTokenColor(next.color, 1) })}
        />
      )}
    </div>
  );
}
