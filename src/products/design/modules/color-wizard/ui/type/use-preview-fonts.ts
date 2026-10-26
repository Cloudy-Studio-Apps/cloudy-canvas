import { useEffect, useState } from "react";

import { fontLibrary } from "@platform";

const WEIGHTS = ["400", "600", "700"] as const;

/**
 * Loads the faces the previews show (regular, semibold and bold of each family, installed or
 * from Google Fonts) and returns a number that bumps as they arrive, so the previews redraw.
 */
export function usePreviewFonts(families: readonly string[]): number {
  const [loaded, setLoaded] = useState(0);
  const key = [...new Set(families)].join("|");
  useEffect(() => {
    let active = true;
    for (const family of key.split("|").filter(Boolean)) {
      for (const weight of WEIGHTS) {
        void fontLibrary
          .load({ family, weight, style: "normal" })
          .then((ok) => active && ok && setLoaded((n) => n + 1))
          .catch(() => undefined);
      }
    }
    return () => {
      active = false;
    };
  }, [key]);
  return loaded;
}
