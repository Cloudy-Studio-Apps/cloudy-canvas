import { useEffect, useMemo, useReducer } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { countedUse, DESIGN_PAGES } from "@design";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import type { TokenUsageView, UsagePage } from "./token-usage.types";

/** Where a variable or a style is used, its layers grouped by page, read again as tokens change. */
export function useTokenUsage(id: string): TokenUsageView {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  // Layers bound or unbound change no token: any change of the document reads it again.
  const [changes, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => engine.doc.onChange(bump), [engine]);
  const scope = useDesignState((state) => state.scope);
  return useMemo(() => {
    const usage = engine.service(DOCUMENT_TOKENS).usageOf(id, countedUse(engine.doc));
    const pages = engine.service(DESIGN_PAGES).pages();
    const layers = [...usage.layers, ...usage.viaStyles];
    const byPage: UsagePage[] = [];
    for (const page of pages) {
      const ids = layers.filter(
        (layer) => (engine.doc.get(layer) as { pageId?: string } | undefined)?.pageId === page.id,
      );
      if (ids.length > 0) byPage.push({ pageId: page.id, name: page.name, ids });
    }
    byPage.sort((a, b) => Number(b.pageId === scope) - Number(a.pageId === scope));
    return { ...usage, byPage, layerCount: layers.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the tokens change
  }, [engine, id, scope, store, changes]);
}
