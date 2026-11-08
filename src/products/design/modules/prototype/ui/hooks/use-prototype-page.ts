import { useEffect, useMemo, useState } from "react";

import { useService } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { DESIGN_PROTOTYPE, screensOf } from "../../model";
import type { PrototypePageView } from "./use-prototype-page.types";

/** The page on screen's flows and screens, read again when the document changes (once a frame). */
export function usePrototypePage(): PrototypePageView {
  const engine = useDesignEngine();
  const prototype = useService(DESIGN_PROTOTYPE);
  const page = useDesignState((state) => state.scope);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let frame = 0;
    const off = engine.doc.onChange(() => {
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        setVersion((value) => value + 1);
      });
    });
    return () => {
      off();
      cancelAnimationFrame(frame);
    };
  }, [engine]);
  return useMemo(
    () => ({
      page,
      flows: page === null ? [] : prototype.flows(page),
      screens: page === null ? [] : screensOf(engine.doc, page),
      version,
    }),
    [engine, prototype, page, version],
  );
}
