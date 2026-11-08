import { useCallback } from "react";

import { libraryIdOf } from "@canvas";
import { useProjectLibrariesState } from "../libraries";

/**
 * Whether a token record can be edited here: the file's own always, a library's only while the
 * project's libraries are open (`ready`), as `useTokenSources` says for a list's groups. A
 * missing record (`undefined`) isn't editable.
 */
export function useTokenEditable(): (record: unknown) => boolean {
  const { status } = useProjectLibrariesState();
  return useCallback(
    (record: unknown) =>
      record !== undefined &&
      record !== null &&
      (libraryIdOf(record) === undefined || status === "ready"),
    [status],
  );
}
