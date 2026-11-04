import { Repeat } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { repeatLayer, repeatOf, scopeAt, templateOf } from "../../repeat";
import { FieldPicker } from "../data-section/field-picker";
import { listNames } from "./list-names";
import { runRepeat } from "./run-repeat";
import { startPatch } from "./start-patch";
import type { CardRepeatProps } from "./card-repeat.types";
import { t } from "../../data.i18n";

/**
 * A layer inside a frame: "Repeat this layer" (asks for the list when the frame doesn't repeat
 * yet, else switches the frame's repeat to this layer), or, for the card the frame repeats,
 * "Repeated by <frame>" with a link that selects the frame, where the settings are.
 */
export function CardRepeat({ node, frame, layers }: CardRepeatProps) {
  const engine = useDesignEngine();
  const repeat = repeatOf(frame);
  const current = repeat ? templateOf(frame, layers) : null;
  if (current?.id === node.id) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {t("repeat.card.repeatedBy", { frame: frame.name })}
        </p>
        <Button variant="link" size="xs" onClick={() => engine.focusElement(frame.id)}>
          {t("repeat.card.select")}
        </Button>
      </div>
    );
  }
  const scope = scopeAt(engine.doc, frame.id);
  const lists = repeat ? [] : listNames(scope);
  const button = (
    <Button
      variant="secondary"
      size="sm"
      className="w-full"
      disabled={!repeat && lists.length === 0}
      onClick={repeat ? () => runRepeat(() => repeatLayer(engine.doc, node.id)) : undefined}
    >
      <Repeat />
      {t("repeat.card.repeat")}
    </Button>
  );
  const note = repeat
    ? t("repeat.card.switchHint", { frame: frame.name, card: current?.name ?? "" })
    : lists.length === 0
      ? t("repeat.noLists")
      : t("repeat.card.hint", { frame: frame.name });
  return (
    <div className="flex flex-col gap-1.5">
      {repeat ? (
        button
      ) : (
        <FieldPicker
          names={lists}
          onPick={(source) =>
            runRepeat(() =>
              repeatLayer(engine.doc, node.id, startPatch(scope, source), {
                addLayout: true,
                kinds: engine.kinds,
              }),
            )
          }
        >
          {button}
        </FieldPicker>
      )}
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
