import { useEffect, useRef } from "react";

import type { SharedFileInfo } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { toast } from "@shared/stores/toast-store";

/**
 * Says once which of the host's plugins this app doesn't have on: what they add is kept in the
 * file but not shown here.
 */
export function useMissingPluginsNotice(file: SharedFileInfo | null): void {
  const shown = useRef(false);
  useEffect(() => {
    if (!file || shown.current) return;
    shown.current = true;
    const { installed, enabled } = usePluginsStore.getState();
    const have = new Set(
      installed.filter((p) => enabled.includes(p.manifest.id)).map((p) => p.manifest.id),
    );
    const missing = file.plugins.filter((id) => !have.has(id));
    if (missing.length === 0) return;
    toast({
      title: "Some of this file may not show",
      description: `The host uses plugins you don't have on: ${missing.join(", ")}. What they add stays in the file.`,
    });
  }, [file]);
}
