import { useEffect, useReducer, useSyncExternalStore } from "react";

import { ER_QUICK_ADD, erQuickAddOptions, isErConnectSource } from "@board";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine, useService } from "@canvas-ui";
import { useErModel } from "../model";

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
          Add from {"name" in source ? source.name : "the hierarchy"}
        </DropdownMenuLabel>
        {erQuickAddOptions(source).map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => {
              quickAdd.close();
              const id = option.run(er.diagram(source.diagram).edits, request.at);
              if (id) engine.focusElement(id);
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
