import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import type { CanvasEngine } from "@canvas";
import { useCanvasFile } from "../file/canvas-file-context";
import type { CanvasStarter } from "./starter.types";

/** The link's query parameter naming the starter a new file begins with. */
const STARTER_PARAM = "starter";

/** The origin a starter writes with: no undo history records it. */
const STARTER_ORIGIN = Symbol("starter");

/**
 * Runs the starter the link asks for (`?starter=<id>`, from Home) on a new file, once, then drops
 * the parameter. An unknown id, or a file that isn't new, is left as it is.
 */
export function useStartStarter<E extends CanvasEngine<object>>(
  engine: E,
  starters: readonly CanvasStarter<E>[],
): void {
  const { isNew } = useCanvasFile();
  const [params, setParams] = useSearchParams();
  const started = useRef<E | null>(null);

  useEffect(() => {
    const asked = params.get(STARTER_PARAM);
    if (!asked || started.current === engine) return;
    started.current = engine;
    const starter = isNew ? starters.find((entry) => entry.id === asked) : undefined;
    if (starter) {
      engine.doc.runAs({ origin: STARTER_ORIGIN, placement: null }, () => starter.start(engine));
    }
    setParams(
      (current) => {
        current.delete(STARTER_PARAM);
        return current;
      },
      { replace: true },
    );
  }, [engine, isNew, params, setParams, starters]);
}
