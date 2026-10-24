import { useRef } from "react";

import { DOCUMENT_TOKENS, type StyleRecord } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { StyleValueWriter } from "./styles.types";

/**
 * Writes a style's value (the layers using it follow), one undo step per change; the steps of a
 * drag (`done: false`, then `done: true`) are one. `bindings`: where its variables go after a
 * stack change (unset: the ones the change overwrote are unlinked).
 */
export function useStyleWriter(style: StyleRecord): StyleValueWriter {
  const engine = useDesignEngine();
  const dragging = useRef(false);
  return {
    write: (value, info = { done: true }, bindings) => {
      const checkpoint = !dragging.current;
      dragging.current = !info.done;
      engine
        .service(DOCUMENT_TOKENS)
        .updateStyle(style.id, { value, ...(bindings ? { bindings } : {}) }, { checkpoint });
    },
  };
}
