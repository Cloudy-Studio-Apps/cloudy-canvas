import { countedUse } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { ListRow } from "@shared/ui/kit";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";

/** The side's "Unused · N" entry: shows the variables and styles nothing uses. */
export function UnusedEntry() {
  const { tokens } = useBoard();
  const showing = useVariablesWindowStore((state) => state.showingUnused);
  const showUnused = useVariablesWindowStore((state) => state.showUnused);
  const engine = useDesignEngine();
  const count = tokens.unused(countedUse(engine.doc)).length;
  return (
    <div className="mt-2 border-t border-border pt-2">
      <ListRow
        label="Unused"
        meta={count}
        selected={showing}
        muted={count === 0}
        onSelect={() => showUnused(!showing)}
      />
    </div>
  );
}
