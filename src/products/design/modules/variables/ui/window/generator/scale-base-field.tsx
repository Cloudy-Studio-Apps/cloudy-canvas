import { NumberField } from "@design/ui/components/panel";
import { scaleDraftBase } from "../scale-drafts";
import { useBoard } from "../use-board";
import type { ScalePartProps } from "./generator.types";

/** The scale's base: a variable's number (followed), or one typed here. */
export function ScaleBaseField({ draft, change }: ScalePartProps) {
  const { store } = useBoard();
  const variable = draft.baseVar ? store.variable(draft.baseVar) : undefined;
  const base = scaleDraftBase(store, draft);
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="flex justify-between text-muted-foreground">
        Base (md)
        {variable && <span className="text-subtle-foreground">from {variable.name}</span>}
      </span>
      {variable ? (
        <div className="flex h-7 items-center gap-2 rounded-md bg-surface-sunken px-2">
          <span className="font-mono">{base}</span>
          <button
            type="button"
            className="ml-auto text-primary hover:underline"
            onClick={() => change({ baseVar: null, baseValue: base })}
          >
            Use a fixed number
          </button>
        </div>
      ) : (
        <NumberField
          prefix="#"
          label="Base"
          min={0}
          value={draft.baseValue}
          onCommit={(baseValue) => change({ baseValue })}
        />
      )}
    </div>
  );
}
