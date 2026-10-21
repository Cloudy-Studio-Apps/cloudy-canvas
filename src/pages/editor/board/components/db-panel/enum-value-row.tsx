import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { CommitInput } from "./commit-input";
import type { EnumValueRowProps } from "./enum-value-row.types";

export function EnumValueRow({ target, value, index }: EnumValueRowProps) {
  const engine = useEngine();
  const last = index === target.values.length - 1;

  return (
    <li className="space-y-1 border-b py-2 last:border-b-0">
      <div className="flex items-center gap-1">
        <CommitInput
          value={value.name}
          aria-label="Value"
          className="h-7 min-w-0 flex-1 font-mono text-xs"
          onCommit={(name) => engine.db.updateEnumValue(target.id, value.id, { name })}
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Move up"
          disabled={index === 0}
          onClick={() => engine.db.moveEnumValue(target.id, value.id, index - 1)}
        >
          <ChevronUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Move down"
          disabled={last}
          onClick={() => engine.db.moveEnumValue(target.id, value.id, index + 1)}
        >
          <ChevronDown />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:text-destructive"
          aria-label={`Delete value ${value.name}`}
          onClick={() => engine.db.removeEnumValue(target.id, value.id)}
        >
          <Trash2 />
        </Button>
      </div>
      <CommitInput
        value={value.note}
        placeholder="Note"
        aria-label="Value note"
        className="h-6 text-xs"
        onCommit={(note) => engine.db.updateEnumValue(target.id, value.id, { note })}
      />
    </li>
  );
}
