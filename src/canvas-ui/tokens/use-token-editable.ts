import { useCallback } from "react";

import { libraryIdOf } from "@canvas";
import { useProjectLibrariesState } from "../libraries";

/**
 * Whether a token record can be edited here: the file's own always, a library's only while the
 * project's libraries are open (`ready`), as `useTokenSources` says for a list's groups.
 */
export function useTokenEditable(): (record: unknown) => boolean {
  const { status } = useProjectLibrariesState();
  return useCallback(
    (record: unknown) => libraryIdOf(record) === undefined || status === "ready",
    [status],
  );
}
