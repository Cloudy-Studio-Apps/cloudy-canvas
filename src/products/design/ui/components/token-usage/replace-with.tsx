import { Replace } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens, VariablePicker } from "@canvas-ui";
import { countedUse } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button, ListRow, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { TokenUsageProps } from "./token-usage.types";

/**
 * Replace with…: every use of this variable (or style) moves to another of its type, layers,
 * aliases, styles and generators included, in one undo step.
 */
export function ReplaceWith({ id }: TokenUsageProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const variable = store.variable(id);
  const style = store.style(id);
  const replace = (to: string) => {
    try {
      const count = engine.service(DOCUMENT_TOKENS).replaceUses(id, to, countedUse(engine.doc));
      const name = store.variable(to)?.name ?? store.style(to)?.name ?? "it";
      toast({ title: `Replaced with ${name}`, description: `${count} layers now use it.` });
    } catch (error) {
      notifyError("Couldn't replace it", error);
    }
  };
  const trigger = (
    <Button variant="outline" size="xs">
      <Replace /> Replace with…
    </Button>
  );
  if (variable) {
    return (
      <VariablePicker type={variable.type} scopes={[]} value={id} modes={{}} onPick={replace}>
        {trigger}
      </VariablePicker>
    );
  }
  if (!style) return null;
  const others = store.styles(style.styleType).filter((s) => s.id !== id);
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="max-h-64 w-56 overflow-y-auto p-1">
        {others.length === 0 ? (
          <p className="p-2 text-xs text-muted-foreground">No other style of this kind.</p>
        ) : (
          others.map((other) => (
            <ListRow key={other.id} label={other.name} onSelect={() => replace(other.id)} />
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
