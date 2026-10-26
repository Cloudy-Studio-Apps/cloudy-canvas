import type { ModeContext } from "@canvas";
import { useEngineState } from "@canvas-ui";
import { usePages } from "../../pages/ui";

const NONE: ModeContext = {};

/** The modes the page on screen uses (what the panel shows values in). */
export function usePageModes(): { pageId: string; modes: ModeContext } {
  const pageId = useEngineState((state) => state.scope) ?? "";
  const page = usePages().find((p) => p.id === pageId);
  return { pageId, modes: page?.variableModes ?? NONE };
}
