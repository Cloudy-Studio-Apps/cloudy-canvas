import { useEffect, useState } from "react";

import { checkBrochure } from "../../checks/check-brochure";
import type { BrochureIssue } from "../../checks/brochure-checks.types";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "./use-brochure";

/** Edits wait this long before the brochure is checked again. */
const CHECK_DELAY_MS = 500;

/** The open brochure's print issues, checked again a moment after the document changes. */
export function useBrochureIssues(): readonly BrochureIssue[] {
  const engine = useDesignEngine();
  const { brochure, version } = useBrochure();
  const [issues, setIssues] = useState<readonly BrochureIssue[]>([]);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      if (!brochure) return setIssues([]);
      void checkBrochure(engine, brochure).then((found) => current && setIssues(found));
    }, CHECK_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [engine, brochure, version]);

  return issues;
}
