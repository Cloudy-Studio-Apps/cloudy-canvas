import { useEffect } from "react";

import type { AgentFile } from "@canvas";
import type { CanvasFileContextValue } from "../file";
import type { ActiveFile } from "./active-file.types";

/** Makes this file the one agents act on while its editor is open. */
export function useAgentFile<Engine>(
  active: ActiveFile<AgentFile<Engine>>,
  id: string,
  engine: Engine,
  file: CanvasFileContextValue,
): void {
  const { name, path, dirty, save } = file;

  useEffect(() => {
    active.set({ id, engine, name, path, dirty, save });
  }, [active, id, engine, name, path, dirty, save]);

  useEffect(
    () => () => {
      if (active.get()?.engine === engine) active.set(null);
    },
    [active, engine],
  );
}
