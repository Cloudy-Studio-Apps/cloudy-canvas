import { X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { InspectorSection } from "./inspector-section";

/**
 * With nothing picked: the modes (rename, remove, add; the first is where the others' empty values
 * come from), and, past one, which mode group the board shows.
 */
export function ModesInspector() {
  const { tokens, store, axis } = useBoard();
  const setAxis = useVariablesWindowStore((state) => state.setAxis);
  const axes = store.axes();
  return (
    <div className="flex flex-col gap-4 text-xs">
      <InspectorSection
        title="Modes"
        actions={
          <button
            type="button"
            onClick={() => tokens.addMode(axis?.id ?? null)}
            className="hover:text-foreground"
          >
            + Mode
          </button>
        }
      >
        {!axis || axis.modes.length < 2 ? (
          <p className="text-muted-foreground">
            One value per variable. Add a mode (like Dark) to give variables another value in it.
          </p>
        ) : (
          axis.modes.map((mode, i) => (
            <div key={mode.id} className="flex items-center gap-1.5">
              <CommitInput
                aria-label="Mode name"
                value={mode.name}
                onCommit={(name) => tokens.renameMode(axis.id, mode.id, name)}
                className="h-7 flex-1 text-xs"
              />
              {i === 0 ? (
                <span
                  className="w-7 text-center text-[10px] text-subtle-foreground"
                  title="The others' empty values use it"
                >
                  first
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Remove ${mode.name}`}
                  onClick={() => {
                    try {
                      tokens.removeMode(axis.id, mode.id);
                    } catch (error) {
                      notifyError("Couldn't remove the mode", error);
                    }
                  }}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </InspectorSection>
      {axes.length > 1 && (
        <InspectorSection title="Mode groups">
          {axes.map((other) => (
            <button
              key={other.id}
              type="button"
              onClick={() => setAxis(other.id)}
              className={`rounded-md px-2 py-1.5 text-left hover:bg-muted ${other.id === axis?.id ? "bg-primary/10 font-medium" : ""}`}
            >
              {other.name}{" "}
              <span className="text-subtle-foreground">· {other.modes.length} modes</span>
            </button>
          ))}
        </InspectorSection>
      )}
      <p className="text-muted-foreground">Pick a card to edit it.</p>
    </div>
  );
}
