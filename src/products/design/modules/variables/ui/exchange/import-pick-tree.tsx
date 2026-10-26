import { Checkbox } from "@shared/ui/kit";

import type { ImportPickTreeProps } from "./exchange.types";

/** The import's tree: each collection or style type, and its top-level groups, all tickable. */
export function ImportPickTree({ rows, ticked, onChange }: ImportPickTreeProps) {
  const set = (keys: readonly string[], on: boolean) => {
    const next = new Set(ticked);
    for (const key of keys) {
      if (on) next.add(key);
      else next.delete(key);
    }
    onChange(next);
  };
  return (
    <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
      {rows.map((row) => {
        const keys = row.children.map((child) => child.key);
        const on = keys.filter((key) => ticked.has(key)).length;
        return (
          <div key={row.key} className="flex flex-col gap-0.5">
            <Checkbox
              checked={on === 0 ? false : on === keys.length ? true : "mixed"}
              onCheckedChange={(checked) => set(keys, checked)}
              label={
                <span className="text-xs font-medium">
                  {row.label} <span className="text-subtle-foreground">{row.count}</span>
                </span>
              }
            />
            {row.children.length > 1 && (
              <div className="ml-5 flex flex-col gap-0.5">
                {row.children.map((child) => (
                  <Checkbox
                    key={child.key}
                    checked={ticked.has(child.key)}
                    onCheckedChange={(checked) => set([child.key], checked)}
                    label={
                      <span className="text-xs">
                        {child.label} <span className="text-subtle-foreground">{child.count}</span>
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
