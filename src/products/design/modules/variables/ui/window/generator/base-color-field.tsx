import { HexInput, FieldBox } from "@design/ui/components/panel";
import { joinTokenColor } from "@canvas";
import { draftBase } from "../shade-drafts";
import { useBoard } from "../use-board";
import { SwatchInput } from "../../swatch-input";
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
        <FieldBox className="gap-0 pl-2">
          <SwatchInput
            color={hex.toLowerCase()}
            label="Base color"
            onChange={(c) => change({ baseColor: joinTokenColor(c, 1) })}
          />
          <HexInput
            color={hex}
            label="Base hex"
            className="px-2"
            onCommit={(c) => change({ baseColor: joinTokenColor(c, 1) })}
          />
        </FieldBox>
      )}
    </div>
  );
}
