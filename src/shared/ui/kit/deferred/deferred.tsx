import { useDeferredValue } from "react";

import type { DeferredProps } from "./deferred.types";

/**
 * Renders its children a moment after it mounts, in a background render React can interrupt, so
 * whatever opened it (a mode switch, a tab) shows at once. Remount it (a `key`) to defer again.
 */
export function Deferred({ children, fallback = null }: DeferredProps) {
  const ready = useDeferredValue(true, false);
  return ready ? children : fallback;
}
