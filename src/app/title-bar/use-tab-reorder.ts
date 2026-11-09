import { useEffect, useRef, type PointerEvent } from "react";

import { useRowDrag } from "@canvas-ui";
import { fileTabs } from "../tabs/file-tabs-instance";
import type { TabReorder } from "./title-bar.types";

/** Which half of the tab under the pointer (by its x: tabs sit in a row) a drop would take. */
function sideByX(overId: string, x: number): "before" | "after" {
  const box = document
    .querySelector<HTMLElement>(`[data-row-drop="${CSS.escape(overId)}"]`)
    ?.getBoundingClientRect();
  return box && x < box.left + box.width / 2 ? "before" : "after";
}

/**
 * Dragging file tabs to reorder them, with the repo's pointer drag (`useRowDrag`; never HTML5
 * `draggable`). That drag's own side is vertical, so the side comes from the pointer's x here.
 */
export function useTabReorder(): TabReorder {
  const pointerX = useRef(0);
  const { drag, grabProps, dropProps } = useRowDrag({
    onDrop: (id, overId) => {
      const tabs = fileTabs.store.get().tabs;
      const over = tabs.findIndex((tab) => tab.id === overId);
      const from = tabs.findIndex((tab) => tab.id === id);
      if (over < 0 || from < 0) return;
      const target = over + (sideByX(overId, pointerX.current) === "after" ? 1 : 0);
      fileTabs.move(id, from < target ? target - 1 : target);
    },
  });
  useEffect(() => {
    if (drag) pointerX.current = drag.pointer.x;
  }, [drag]);
  return {
    drag,
    rowProps: (id) => ({
      ...dropProps(id),
      onPointerDown: (event: PointerEvent<HTMLElement>) => grabProps(id).onPointerDown(event),
    }),
    dropSideOf: (id) =>
      drag?.overId === id && drag.id !== id ? sideByX(id, drag.pointer.x) : null,
  };
}
