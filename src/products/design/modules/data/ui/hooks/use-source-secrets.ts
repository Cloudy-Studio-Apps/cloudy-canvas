import { useEffect, useReducer, useState } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import type { DataSourceElement } from "../../source";
import { filePathKey, loadFilePaths, loadSourceSecrets, missingSecretKeys } from "../../update";
import { platformDataServices } from "./data-services";
import { useDataRegistry } from "./use-data-registry";
import type { SourceSecrets } from "./use-source-secrets.types";

const NONE: ReadonlySet<string> = new Set();

/**
 * Which of a source's secrets (and file paths) this device has, read again when its settings
 * change and on every change the service reports (an agent's secret write, an Update).
 */
export function useSourceSecrets(source: DataSourceElement): SourceSecrets {
  const sources = useService(DESIGN_DATA_SOURCES);
  const { types } = useDataRegistry();
  const [round, refresh] = useReducer((n: number) => n + 1, 0);
  const [state, setState] = useState({ stored: NONE, missing: [] as string[] });
  const type = types.find((item) => item.id === source.sourceType);
  // The record is read anew on each render: its settings, as text, say when to read again.
  const settingsKey = JSON.stringify(source.settings);

  useEffect(() => sources.onChange(refresh), [sources]);

  useEffect(() => {
    if (!type) return;
    let live = true;
    const settings = JSON.parse(settingsKey) as DataSourceElement["settings"];
    const services = platformDataServices;
    void Promise.all([
      loadSourceSecrets(services, source.id, type, settings),
      loadFilePaths(services, source.id, type.settings, settings),
    ])
      .then(([found, paths]) => {
        if (!live) return;
        setState({
          stored: new Set([...Object.keys(found), ...Object.keys(paths).map(filePathKey)]),
          missing: missingSecretKeys(type.settings, settings, found),
        });
      })
      // A store that can't be read leaves the lines as they were; Update reports the failure.
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [type, source.id, settingsKey, round]);

  return { ...state, refresh };
}
