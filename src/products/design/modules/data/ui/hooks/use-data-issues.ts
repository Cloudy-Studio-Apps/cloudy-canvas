import { useEffect, useState } from "react";

import { debounce } from "@canvas";
import { useService } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { dataIssues } from "../../checks";
import type { DataIssues } from "../../checks";
import { DESIGN_DATA_SOURCES } from "../../model";

const NONE: DataIssues = { issues: [], truncated: false };
const DELAY_MS = 300;

/**
 * The data that doesn't fit (`dataIssues`), found while the caller is mounted (the Data tab) and
 * again, debounced, after the document or a source changes.
 */
export function useDataIssues(): DataIssues {
  const engine = useDesignEngine();
  const sources = useService(DESIGN_DATA_SOURCES);
  const [found, setFound] = useState<DataIssues>(NONE);

  useEffect(() => {
    const run = () => setFound(dataIssues(engine.doc, { sources, kinds: engine.kinds }));
    run();
    const later = debounce(run, DELAY_MS);
    const offDoc = engine.doc.observe(later);
    const offSources = sources.onChange(later);
    return () => {
      later.cancel();
      offDoc();
      offSources();
    };
  }, [engine, sources]);

  return found;
}
