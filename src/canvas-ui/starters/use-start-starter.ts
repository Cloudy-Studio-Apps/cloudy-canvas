import { useEffect, useRef } from "react";

import type { CanvasEngine } from "@canvas";
import { useCanvasFile } from "../file/canvas-file-context";
import { useDropTabParam, useTabParam } from "../tabs/tab-context";
import type { CanvasStarter } from "./starter.types";

/** The origin a starter writes with: no undo history records it. */
const STARTER_ORIGIN = Symbol("starter");

/**
 * Runs the starter the link asks for (`?starter=<id>`, from Home) on a new file, once, then drops
 * the parameter from its tab. An unknown id, or a file that isn't new, is left as it is.
 */
export function useStartStarter<E extends CanvasEngine<object>>(
  engine: E,
  starters: readonly CanvasStarter<E>[],
): void {
  const { isNew } = useCanvasFile();
  // The link's query parameter naming the starter a new file begins with, kept by its tab.
  const asked = useTabParam("starter");
  const dropParam = useDropTabParam();
  const started = useRef<E | null>(null);

  useEffect(() => {
    if (!asked || started.current === engine) return;
    started.current = engine;
    const starter = isNew ? starters.find((entry) => entry.id === asked) : undefined;
    if (starter) {
      engine.doc.runAs({ origin: STARTER_ORIGIN, placement: null }, () => starter.start(engine));
    }
    dropParam("starter");
  }, [engine, isNew, asked, dropParam, starters]);
}
