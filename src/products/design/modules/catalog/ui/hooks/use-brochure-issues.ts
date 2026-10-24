import { useEffect, useState } from "react";

import { checkBrochure, type BrochureIssue } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "./use-brochure";

/** Edits wait this long before the brochure is checked again. */
const CHECK_DELAY_MS = 500;

/** The brochure's print issues, checked again a moment after the document changes. */
export function useBrochureIssues(): readonly BrochureIssue[] {
  const engine = useDesignEngine();
  const { version } = useBrochure();
  const [issues, setIssues] = useState<readonly BrochureIssue[]>([]);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      void checkBrochure(engine).then((found) => current && setIssues(found));
    }, CHECK_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [engine, version]);

  return issues;
}
