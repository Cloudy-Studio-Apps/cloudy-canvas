import { Trash2, X } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { useBoardSchema } from "../schema";
import { CommitInput } from "./commit-input";
import { FlagToggle } from "./flag-toggle";
import { IndexPartPicker } from "./index-part-picker";
import type { IndexRowProps } from "./index-row.types";

/** One index: its columns/expressions as chips, PK/UQ, name, method and note. */
export function IndexRow({ table, index, typeListId }: IndexRowProps) {
  const schema = useBoardSchema();
  const update = (patch: Parameters<typeof schema.updateIndex>[2]) =>
    schema.updateIndex(table.id, index.id, patch);

  return (
    <li className="space-y-1.5 border-b py-2 last:border-b-0">
      <div className="flex items-start gap-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {index.parts.map((part, i) => {
            const label =
              part.kind === "expr"
                ? `\`${part.expr}\``
                : (table.columns.find((c) => c.id === part.columnId)?.name ?? "?");
            return (
              <span
                key={i}
                className="inline-flex h-6 items-center gap-0.5 rounded-sm border bg-surface-sunken pr-0.5 pl-1.5 font-mono text-xs"
              >
                {label}
                <button
                  type="button"
                  className="cursor-pointer rounded-xs p-0.5 text-muted-foreground hover:bg-hover hover:text-foreground"
                  aria-label={`Remove ${label} from the index`}
                  onClick={() => update({ parts: index.parts.filter((_, j) => j !== i) })}
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
          <IndexPartPicker
            table={table}
            parts={index.parts}
            onAdd={(part) => update({ parts: [...index.parts, part] })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:text-destructive"
          aria-label="Delete index"
          title="Delete index"
          onClick={() => schema.removeIndex(table.id, index.id)}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <FlagToggle
          label="PK"
          title="Primary key"
          on={index.pk}
          onToggle={() => update({ pk: !index.pk })}
        />
        <FlagToggle
          label="UQ"
          title="Unique"
          on={index.unique}
          onToggle={() => update({ unique: !index.unique })}
        />
        <CommitInput
          value={index.name}
          placeholder="Name"
          aria-label="Index name"
          className="h-6 min-w-0 flex-1 text-xs"
          onCommit={(name) => update({ name: name.trim() })}
        />
        <CommitInput
          value={index.type}
          placeholder="Method"
          aria-label="Index method"
          list={typeListId}
          className="h-6 w-20 font-mono text-xs"
          onCommit={(type) => update({ type: type.trim() })}
        />
      </div>
      <CommitInput
        value={index.note}
        placeholder="Note"
        aria-label="Index note"
        className="h-6 text-xs"
        onCommit={(note) => update({ note })}
      />
    </li>
  );
}
