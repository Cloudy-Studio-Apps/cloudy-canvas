import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Trash2,
} from "lucide-react";

import { insertLine, isTable, linePart, parseTablePart } from "@board";
import { OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

/** Insert before/after and delete for the table row or column selected with its grip. */
export function TableLineActions() {
  const engine = useBoardEngine();
  const selectedId = useBoardState((state) => state.selectedId);
  const part = parseTablePart(useBoardState((state) => state.selectedPart));
  if (!selectedId || !part || part.kind === "cells") return null;

  const axis = part.kind;
  const name = axis === "row" ? "row" : "column";
  const insert = (after: boolean) => {
    const table = engine.doc.get(selectedId);
    if (!isTable(table)) return;
    const at = part.index + (after ? 1 : 0);
    engine.doc.checkpoint();
    engine.doc.update(table.id, insertLine(table, axis, at));
    // The selected line moves down (or right) when one is inserted before it.
    engine.setSelectedPart(linePart(axis, after ? part.index : part.index + 1));
  };
  const Before = axis === "row" ? BetweenHorizontalStart : BetweenVerticalStart;
  const After = axis === "row" ? BetweenHorizontalEnd : BetweenVerticalEnd;

  return (
    <>
      <PanelDivider />
      <OptionButton
        selected={false}
        aria-label={`Insert ${name} before`}
        title={`Insert ${name} ${axis === "row" ? "above" : "left"}`}
        onClick={() => insert(false)}
      >
        <Before className="size-[18px]" />
      </OptionButton>
      <OptionButton
        selected={false}
        aria-label={`Insert ${name} after`}
        title={`Insert ${name} ${axis === "row" ? "below" : "right"}`}
        onClick={() => insert(true)}
      >
        <After className="size-[18px]" />
      </OptionButton>
      <OptionButton
        selected={false}
        aria-label={`Delete ${name}`}
        title={`Delete ${name} (${engine.keymap.label("deleteSelection")})`}
        onClick={() => void engine.deleteSelection()}
      >
        <Trash2 className="size-[18px]" />
      </OptionButton>
    </>
  );
}
