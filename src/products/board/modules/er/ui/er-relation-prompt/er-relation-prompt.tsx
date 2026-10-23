import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";

import { ER_RELATION_PROMPT, ER_RELATION_RATIOS, type ErRelationEnd } from "@board";
import { FloatingPanel, useEngine, useService } from "@canvas-ui";
import { useErModel } from "../model";
import { ErJoinStep } from "./er-join-step";
import { ErRatioPicker } from "./er-ratio-picker";
import type { ErJoinValue, ErPickedRatio } from "./er-relation-prompt.types";
import { joinAttributes, joinOf, newKeyName } from "./join-options";

/**
 * Asks what a relation dragged between two entities is: one to one, one to many, many to one or
 * many to many (with pictures), then which attribute the join goes through (`Cliente.id`). Only
 * then is the relation made, as one undo step (joining the two diagrams when they differ). It sits
 * where the relation will go and follows the view; Esc or a click elsewhere cancels.
 */
export function ErRelationPrompt() {
  const engine = useEngine();
  const er = useErModel();
  const prompt = useService(ER_RELATION_PROMPT);
  const request = useSyncExternalStore(prompt.subscribe, prompt.current);
  // The kind picked for this request (a new request starts over).
  const [picked, setPicked] = useState<ErPickedRatio | null>(null);
  const ratioId = picked && picked.request === request ? picked.id : null;
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!request) return;
    const unsubscribe = engine.onViewChange(redraw);
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      prompt.close();
    };
    const press = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) prompt.close();
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("pointerdown", press, true);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("pointerdown", press, true);
    };
  }, [engine, prompt, request]);

  const from = request ? er.shape(request.fromId) : undefined;
  const to = request ? er.shape(request.toId) : undefined;
  if (!request || !from || !to) return null;
  const ratio = ER_RELATION_RATIOS.find((r) => r.id === ratioId);
  const point = engine.worldRectToScreen({ ...request.at, w: 0, h: 0 });
  const name = (el: typeof from) => ("name" in el ? el.name : "");

  const create = (joins: ReadonlyMap<"from" | "to", ErJoinValue>) => {
    if (!ratio) return;
    const end = (side: "from" | "to"): ErRelationEnd => {
      const el = side === "from" ? from : to;
      const attributes = joinAttributes(el, er.diagram(el.diagram).shapes().attributes);
      const cardinality = side === "from" ? ratio.fromCardinality : ratio.toCardinality;
      return {
        entityId: el.id,
        ...cardinality,
        join: joinOf(joins.get(side), newKeyName(attributes)),
      };
    };
    const ends = [end("from"), end("to")];
    const edit = () => er.diagram(from.diagram).edits.addLinkedRelation(ends, { at: request.at });
    prompt.close();
    const id = from.diagram === to.diagram ? edit() : er.join(from.diagram, to.diagram, edit);
    if (id) engine.focusElement(id);
  };

  return (
    <div
      ref={panel}
      className="pointer-events-none absolute z-30 -translate-x-1/2 translate-y-3"
      style={{ left: point.x, top: point.y }}
    >
      <FloatingPanel
        role="dialog"
        aria-label="New relation"
        className="w-80 flex-col items-stretch gap-1 p-2"
      >
        {ratio ? (
          <ErJoinStep
            ratio={ratio}
            from={from}
            to={to}
            onBack={() => setPicked(null)}
            onCreate={create}
          />
        ) : (
          <ErRatioPicker
            from={name(from)}
            to={name(to)}
            onPick={(id) => setPicked({ request, id })}
          />
        )}
      </FloatingPanel>
    </div>
  );
}
