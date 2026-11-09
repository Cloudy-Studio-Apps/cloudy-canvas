import type { DesignEngine } from "@design";
import { useAgentFile, type CanvasFileContextValue } from "@canvas-ui";
import { designFiles } from "./active-design";

/** Registers this design for agents under its tab while its editor is mounted. */
export function useAgentDesign(
  id: string,
  engine: DesignEngine,
  file: CanvasFileContextValue,
): void {
  useAgentFile(designFiles, id, engine, file);
}
