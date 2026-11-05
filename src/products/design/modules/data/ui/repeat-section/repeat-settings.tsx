import { Button } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { repeatRows, scopeAt } from "../../repeat";
import { LimitFields } from "./limit-fields";
import { RepeatRowsFields } from "./repeat-rows-fields";
import type { RepeatSettingsProps } from "./repeat-settings.types";
import { t } from "../../data.i18n";

/**
 * A frame's repeat: the list, the row's name, the key, which rows (filter, sort, limits), how
 * many show, and Remove repeat. Each change is one `setRepeat` step.
 */
export function RepeatSettingsBlock({ frameId, repeat, apply }: RepeatSettingsProps) {
  const engine = useDesignEngine();
  const scope = scopeAt(engine.doc, frameId);
  const rows = repeatRows(repeat, scope, "design");

  return (
    <div className="flex flex-col gap-3">
      <RepeatRowsFields repeat={repeat} scope={scope} apply={apply} />
      <div className="flex flex-col gap-1.5">
        <LimitFields repeat={repeat} apply={apply} />
        <p className="text-xs text-muted-foreground">
          {t("repeat.count", { shown: rows.rows.length, count: rows.total })}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => apply(null)}>
        {t("repeat.remove")}
      </Button>
    </div>
  );
}
