import { useCallback } from "react";

import { libraryIdOf } from "@canvas";
import { useProjectLibrariesState } from "../libraries";

/**
 * Whether a token record can be edited here: the file's own always, a library's only while the
 * project's libraries are open (`ready`) and that library could be read (`hub.library`), as
 * `useTokenSources` says for a list's groups. A missing record (`undefined`) isn't editable.
 */
export function useTokenEditable(): (record: unknown) => boolean {
  const { status, hub } = useProjectLibrariesState();
  return useCallback(
    (record: unknown) => {
      if (record === undefined || record === null) return false;
      const libraryId = libraryIdOf(record);
      if (libraryId === undefined) return true;
      return status === "ready" && hub?.library(libraryId) !== undefined;
    },
    [status, hub],
  );
}
