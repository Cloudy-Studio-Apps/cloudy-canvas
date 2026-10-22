import type { DesignEngine } from "@design";
import { useAgentFile, type CanvasFileContextValue } from "@canvas-ui";
import { activeDesign } from "./active-design";

/** Makes this design the one agents act on while it's open. */
export function useAgentDesign(
  id: string,
  engine: DesignEngine,
  file: CanvasFileContextValue,
): void {
  useAgentFile(activeDesign, id, engine, file);
}
