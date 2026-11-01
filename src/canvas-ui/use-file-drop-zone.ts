import { useEffect, useRef, type RefObject } from "react";

import type { DroppedFile, FileDrop } from "@shared/core";
import { useFileDropStore } from "@shared/stores/file-drop-store";
import { useFileDragOver } from "@shared/ui/hooks/use-file-drag-over";

/**
 * Takes a file dropped on `zone` while mounted; drops anywhere else go where they went before (the
 * canvas). The desktop app takes file drops before the page sees them, so an element's `onDrop`
 * never gets one there. Returns whether files are being dragged over the window, to show the zone.
 */
export function useFileDropZone(
  zone: RefObject<HTMLElement | null>,
  onDrop: (file: DroppedFile) => void,
): boolean {
  const latest = useRef(onDrop);
  useEffect(() => {
    latest.current = onDrop;
  });

  useEffect(() => {
    const store = useFileDropStore.getState();
    const previous = store.target;
    const target = (drop: FileDrop) => {
      const file = drop.files[0];
      const box = zone.current?.getBoundingClientRect();
      if (file && box && inside(box, drop.at)) latest.current(file);
      else previous?.(drop);
    };
    store.setTarget(target);
    return () => {
      if (useFileDropStore.getState().target === target) {
        useFileDropStore.getState().setTarget(previous);
      }
    };
  }, [zone]);

  return useFileDragOver();
}

function inside(box: DOMRect, point: FileDrop["at"]): boolean {
  return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
}
