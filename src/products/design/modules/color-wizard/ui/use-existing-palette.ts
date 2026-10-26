import { useEffect, useRef } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useService } from "@canvas-ui";
import { existingPalette } from "..";
import { useColorWizardStore } from "./store";

/**
 * When the wizard opens on a file that has a palette made of shade generators, it starts from it
 * (its collection and roles), once per session, so it edits the system instead of adding one.
 */
export function useExistingPalette(open: boolean): void {
  const tokens = useService(DOCUMENT_TOKENS);
  const loaded = useRef(false);
  useEffect(() => {
    if (!open || loaded.current) return;
    loaded.current = true;
    const found = existingPalette(tokens.store());
    if (!found || !found.roles.length) return;
    useColorWizardStore.getState().set({
      collection: found.collection,
      palette: found.roles.map((r) => ({ hex: r.hex, name: r.name, locked: false })),
      past: [],
      future: [],
      roles: [],
      harmony: "custom",
    });
  }, [open, tokens]);
}
