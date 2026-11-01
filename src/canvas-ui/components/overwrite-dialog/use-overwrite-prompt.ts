import { useState } from "react";

import type { OverwriteRequest } from "./overwrite-dialog.types";

/**
 * Asking before files are replaced: `confirm` is what `exportFiles` takes, and `request` and
 * `answer` go to an `OverwriteDialog`.
 */
export function useOverwritePrompt() {
  const [request, setRequest] = useState<OverwriteRequest | null>(null);
  const confirm = (existing: string[]) =>
    new Promise<boolean>((resolve) => setRequest({ existing, resolve }));
  const answer = (replace: boolean) => {
    request?.resolve(replace);
    setRequest(null);
  };
  return { request, confirm, answer };
}
