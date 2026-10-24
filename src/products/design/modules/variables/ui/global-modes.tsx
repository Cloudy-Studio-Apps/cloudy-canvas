import { DOCUMENT_TOKENS, modeFor } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/lib/utils";

/**
 * The file's modes, one switch per axis with several (Light | Dark): switching one changes every
 * layer using variables that vary by it, except in frames set to their own mode.
 */
export function GlobalModes() {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const axes = store.switchableAxes();
  if (axes.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {axes.map((axis) => {
        const current = modeFor(axis, {});
        return (
          <div key={axis.id} className="flex flex-col gap-1">
            {axes.length > 1 && (
              <span className="text-[11px] text-subtle-foreground">{axis.name}</span>
            )}
            <div
              role="radiogroup"
              aria-label={axis.name}
              className="flex rounded-md bg-muted p-0.5"
            >
              {axis.modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="radio"
                  aria-checked={mode.id === current}
                  onClick={() => engine.service(DOCUMENT_TOKENS).setCurrentMode(axis.id, mode.id)}
                  className={cn(
                    "h-6 min-w-0 flex-1 truncate rounded-sm px-2 text-xs text-muted-foreground",
                    mode.id === current && "bg-surface font-medium text-foreground shadow-xs",
                  )}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
