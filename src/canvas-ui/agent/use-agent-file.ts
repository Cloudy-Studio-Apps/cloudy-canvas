import { useEffect } from "react";

import type { AgentFile } from "@canvas";
import type { CanvasFileContextValue } from "../file";
import { useTabContext } from "../tabs/tab-context";
import { useIsActiveTab } from "../tabs/use-is-active-tab";
import type { AgentFiles } from "./agent-files.types";

/** Registers this file for agents under its tab while its editor is mounted. */
export function useAgentFile<Engine>(
  files: AgentFiles<AgentFile<Engine>>,
  id: string,
  engine: Engine,
  file: CanvasFileContextValue,
): void {
  const { tabId } = useTabContext();
  const active = useIsActiveTab();
  const { name, path, dirty, save } = file;

  useEffect(() => {
    files.set(tabId, {
      id,
      engine,
      name,
      path,
      dirty,
      save: async () => {
        await save();
      },
    });
  }, [files, tabId, id, engine, name, path, dirty, save]);

  useEffect(
    () => () => {
      if (files.get(tabId)?.engine === engine) files.set(tabId, null);
    },
    [files, tabId, engine],
  );

  useEffect(() => {
    files.setActive(tabId, active);
    return () => files.setActive(tabId, false);
  }, [files, tabId, active]);
}
