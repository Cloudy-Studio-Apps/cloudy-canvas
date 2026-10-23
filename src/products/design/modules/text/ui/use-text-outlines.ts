import { useEffect } from "react";

import { fontKey, type GlyphOutliner } from "@shared/core";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { TextNodeElement } from "../text.types";

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
        const texts = engine.elements().filter(
          (el) =>
            el.type === "text" &&
            fontKey({
              family: (el as TextNodeElement).fontFamily,
              weight: (el as TextNodeElement).fontWeight,
              style: (el as TextNodeElement).fontStyle,
            }) === key,
        );
        if (texts.length > 0) engine.refreshElements(texts.map((el) => el.id));
      }),
    [engine, outliner],
  );
}
