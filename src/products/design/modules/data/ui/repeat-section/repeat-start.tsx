import { Repeat } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { lookup } from "../../bindings";
import { scopeAt } from "../../repeat";
import { FieldPicker } from "../data-section/field-picker";
import { listNames } from "./list-names";
import type { RepeatStartProps } from "./repeat-start.types";
import { t } from "../../data.i18n";

/** Copies made while designing when a long list is picked: the rest show in an export. */
const DESIGN_LIMIT = 24;

/**
 * A frame without a repeat: "Repeat for each row" asks for the list, then repeats the frame's
 * first layer with a wrapping row layout. A list longer than 24 rows shows 24 while designing.
 */
export function RepeatStart({ frameId, hasLayer, apply }: RepeatStartProps) {
  const engine = useDesignEngine();
  const scope = scopeAt(engine.doc, frameId);
  const lists = listNames(scope);
  const start = (source: string) => {
    const rows = lookup(scope, source)?.value;
    const long = Array.isArray(rows) && rows.length > DESIGN_LIMIT;
    apply(
      { source, ...(long ? { designLimit: DESIGN_LIMIT } : {}) },
      { addLayout: true, kinds: engine.kinds },
    );
  };
  const note = !hasLayer ? t("repeat.noLayer") : lists.length === 0 ? t("repeat.noLists") : null;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldPicker names={lists} onPick={start}>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!hasLayer || lists.length === 0}
        >
          <Repeat />
          {t("repeat.start")}
        </Button>
      </FieldPicker>
      <p className="text-xs text-muted-foreground">{note ?? t("repeat.hint")}</p>
    </div>
  );
}
