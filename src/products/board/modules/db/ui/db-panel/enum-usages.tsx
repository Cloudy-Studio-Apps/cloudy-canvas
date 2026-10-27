import { LocateFixed } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useEngine } from "@canvas-ui";
import { useDbQuery } from "../schema";
import type { EnumUsagesProps } from "./enum-usages.types";
import { t } from "../../db.i18n";

/** Columns typed with this enum, with a shortcut to jump to their table. */
export function EnumUsages({ enumId }: EnumUsagesProps) {
  const engine = useEngine();
  const usages = useDbQuery((db) => db.enumUsages(enumId), enumId);

  return (
    <section className="space-y-1">
      <h3 className="text-xs font-medium text-muted-foreground">{t("enumEditor.usedBy")}</h3>
      {usages.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("enumEditor.noUsages")}</p>
      )}
      <ul>
        {usages.map(({ table, column }) => (
          <li key={`${table.id}/${column.id}`} className="flex items-center gap-1 text-sm">
            <span className="min-w-0 flex-1 truncate">
              {table.name}.{column.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("nav.goTo", { name: table.name })}
              title={t("nav.goToTable")}
              onClick={() => engine.focusElement(table.id)}
            >
              <LocateFixed />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
