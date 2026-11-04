import { Repeat } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { scopeAt } from "../../repeat";
import { FieldPicker } from "../data-section/field-picker";
import { listNames } from "./list-names";
import { startPatch } from "./start-patch";
import type { RepeatStartProps } from "./repeat-start.types";
import { t } from "../../data.i18n";

/**
 * A frame without a repeat: "Repeat for each row" asks for the list, then repeats the chosen
 * card, the frame holding its copies in a wrapping row (an auto layout when it has none).
 */
export function RepeatStart({ frameId, cardId, apply }: RepeatStartProps) {
  const engine = useDesignEngine();
  const scope = scopeAt(engine.doc, frameId);
  const lists = listNames(scope);
  const start = (source: string) =>
    apply(
      { ...startPatch(scope, source), template: cardId },
      { addLayout: true, kinds: engine.kinds },
    );
  const note = !cardId ? t("repeat.noLayer") : lists.length === 0 ? t("repeat.noLists") : null;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldPicker names={lists} onPick={start}>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!cardId || lists.length === 0}
        >
          <Repeat />
          {t("repeat.start")}
        </Button>
      </FieldPicker>
      <p className="text-xs text-muted-foreground">{note ?? t("repeat.hint")}</p>
    </div>
  );
}
