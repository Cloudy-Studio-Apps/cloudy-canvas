import { useEffect, useReducer, useState } from "react";

import type { DataSourceElement } from "../../source";
import { loadSecrets, missingSecretKeys, secretKeys } from "../../update";
import { platformDataServices } from "./data-services";
import { useDataRegistry } from "./use-data-registry";
import type { SourceSecrets } from "./use-source-secrets.types";

const NONE: ReadonlySet<string> = new Set();

/** Which of a source's secrets this device has, read again when its settings change. */
export function useSourceSecrets(source: DataSourceElement): SourceSecrets {
  const { types } = useDataRegistry();
  const [round, refresh] = useReducer((n: number) => n + 1, 0);
  const [state, setState] = useState({ stored: NONE, missing: [] as string[] });
  const type = types.find((item) => item.id === source.sourceType);
  // The record is read anew on each render: its settings, as text, say when to read again.
  const settingsKey = JSON.stringify(source.settings);

  useEffect(() => {
    if (!type) return;
    let live = true;
    const settings = JSON.parse(settingsKey) as DataSourceElement["settings"];
    void loadSecrets(platformDataServices, source.id, secretKeys(type.settings, settings))
      .then((found) => {
        if (!live) return;
        setState({
          stored: new Set(Object.keys(found)),
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
