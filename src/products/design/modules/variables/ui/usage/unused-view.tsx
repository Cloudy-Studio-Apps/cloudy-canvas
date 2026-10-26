import { useEffect, useMemo, useReducer, useState } from "react";

import { resolveVariable } from "@canvas";
import { countedUse } from "@design";
import { DeleteTokensDialog } from "../../../core/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, EmptyState } from "@shared/ui/kit";
import { useBoard } from "../window/use-board";
import { UnusedRow } from "./unused-row";

/**
 * Find unused: the variables and styles nothing uses (no layer, alias, style or generator), to
 * delete some or all of them in one undo step.
 */
export function UnusedView() {
  const { tokens, store } = useBoard();
  const engine = useDesignEngine();
  // Binding a layer changes no token: any document change reads the list again.
  const [changes, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => engine.doc.onChange(bump), [engine]);
  const unused = useMemo(
    () => tokens.unused(countedUse(engine.doc)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read again on every change
    [tokens, engine, store, changes],
  );
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const kept = [...picked].filter((id) => unused.includes(id));

  if (unused.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <EmptyState
          title="Everything is used"
          description="Every variable and style is used by a layer, an alias, a style or a generator."
        />
      </div>
    );
  }
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Unused · {unused.length}</h3>
          <p className="text-xs text-muted-foreground">
            Not used by any layer, alias, style or generator.
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="xs"
            variant="outline"
            disabled={kept.length === 0}
            onClick={() => setDeleting(kept)}
          >
            Delete {kept.length || ""} picked
          </Button>
          <Button size="xs" variant="outline" onClick={() => setDeleting(unused)}>
            Delete all unused
          </Button>
        </div>
      </header>
      <div className="flex flex-col gap-px">
        {unused.map((id) => {
          const record = store.variable(id) ?? store.style(id);
          if (!record) return null;
          const where =
            record.kind === "style"
              ? `${record.styleType} style`
              : (store.collection(record.collectionId)?.name ?? "");
          const value =
            record.kind === "variable" && record.type === "color"
              ? resolveVariable(store, id, {})
              : null;
          return (
            <UnusedRow
              key={id}
              record={record}
              where={where}
              color={value?.type === "color" ? value.color : undefined}
              checked={picked.has(id)}
              onCheckedChange={(checked) => {
                const next = new Set(picked);
                if (checked) next.add(id);
                else next.delete(id);
                setPicked(next);
              }}
            />
          );
        })}
      </div>
      <DeleteTokensDialog ids={deleting} onClose={() => setDeleting(null)} />
    </section>
  );
}
