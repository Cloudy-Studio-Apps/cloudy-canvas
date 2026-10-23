import { useEffect } from "react";

import { fontKey, type GlyphOutliner } from "@shared/core";
import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * Once a face can be outlined, the texts in it are read again, so the booleans, vector masks and
 * flattening made of them get their glyphs.
 */
export function useTextOutlines(outliner: GlyphOutliner): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      outliner.onReady((font) => {
        const key = fontKey(font);
        // A text's ranges may use other faces than its own.
        const texts = engine.elements().filter(
          (el) =>
            el.type === "text" &&
            engine.kinds
              .kindOf(el)
              .fonts(el)
              .some((face) => fontKey(face) === key),
        );
        if (texts.length > 0) engine.refreshElements(texts.map((el) => el.id));
      }),
    [engine, outliner],
  );
}
