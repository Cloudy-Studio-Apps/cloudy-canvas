import { useBoard } from "../use-board";
import type { InspectorPartProps } from "./inspector.types";

/** How many layers use a variable, and selecting those on the page on screen. */
export function UsageRow({ variable }: InspectorPartProps) {
  const { engine, tokens } = useBoard();
  const users = tokens.usage(variable.id);
  const here = users.filter((id) => engine.getElement(id));
  if (users.length === 0) return <p className="text-xs text-subtle-foreground">Not used yet.</p>;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      Used by {users.length} {users.length === 1 ? "layer" : "layers"}
      {here.length > 0 && (
        <button
          type="button"
          onClick={() => engine.select(here)}
          className="text-primary hover:underline"
        >
          Select {here.length < users.length ? `${here.length} on this page` : "them"}
        </button>
      )}
    </div>
  );
}
