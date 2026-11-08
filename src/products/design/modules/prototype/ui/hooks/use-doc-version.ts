import { useEffect, useState } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * Counts the document's changes (at most one a frame): what to key a memo on that reads the
 * document.
 */
export function useDocVersion(): number {
  const engine = useDesignEngine();
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
  return version;
}
