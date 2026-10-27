import { useEffect, useReducer, useSyncExternalStore } from "react";

import { ER_QUICK_ADD, erQuickAddOptions } from "../../connect/er-quick-add";
import { gateOf } from "../../model/standard-of";
import { isErConnectSource } from "../../connect/er-connect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { useEngine, useService } from "@canvas-ui";
import { useErModel } from "../model";
import { t } from "../../er.i18n";

/**
 * The menu a connect dot dropped on empty board opens there: what to create from the entity,
 * relation or hierarchy it came from (an attribute, a related entity, a subtype…). It follows the
 * point as the view moves; picking selects what was made, Esc or a click elsewhere dismisses it.
 */
export function ErQuickAddMenu() {
  const engine = useEngine();
  const er = useErModel();
  const quickAdd = useService(ER_QUICK_ADD);
  const request = useSyncExternalStore(quickAdd.subscribe, quickAdd.current);
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  useEffect(() => (request ? engine.onViewChange(redraw) : undefined), [engine, request]);

  const source = request ? er.shape(request.sourceId) : undefined;
  if (!request || !isErConnectSource(source)) return null;
  const point = engine.worldRectToScreen({ ...request.at, w: 0, h: 0 });
  const gate = gateOf(er.diagram(source.diagram).shapes());

  return (
    <DropdownMenu open modal={false} onOpenChange={(open) => !open && quickAdd.close()}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none absolute size-0"
          style={{ left: point.x, top: point.y }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuLabel>
          {t("quickAdd.addFrom", {
            name: "name" in source ? source.name : t("quickAdd.theHierarchy"),
          })}
        </DropdownMenuLabel>
        {erQuickAddOptions(source).map((option) => {
          // What the diagram's standard forbids is listed, disabled, with the reason.
          const reason = option.construct ? gate.reason(option.construct) : "";
          return (
            <DropdownMenuItem
              key={option.id}
              disabled={reason !== ""}
              title={reason || undefined}
              onSelect={() => {
                quickAdd.close();
                const id = option.run(er.diagram(source.diagram).edits, request.at);
                if (id) engine.focusElement(id);
              }}
            >
              <span className="flex flex-col">
                {option.label}
                {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
