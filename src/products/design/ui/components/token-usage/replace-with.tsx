import { Replace } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens, VariablePicker } from "@canvas-ui";
import { countedUse } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button, ListRow, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { TokenUsageProps } from "./token-usage.types";
import { t } from "../../design-ui.i18n";

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
      const name = store.variable(to)?.name ?? store.style(to)?.name ?? t("tokenUsage.replace.it");
      toast({
        title: t("tokenUsage.replace.done", { name }),
        description: t("tokenUsage.replace.layersUse", { count }),
      });
    } catch (error) {
      notifyError(t("tokenUsage.replace.failed"), error);
    }
  };
  const trigger = (
    <Button variant="outline" size="xs">
      <Replace /> {t("tokenUsage.replace.button")}
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
          <p className="p-2 text-xs text-muted-foreground">{t("tokenUsage.replace.none")}</p>
        ) : (
          others.map((other) => (
            <ListRow key={other.id} label={other.name} onSelect={() => replace(other.id)} />
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
