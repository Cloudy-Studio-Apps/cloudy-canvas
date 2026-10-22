import { useEffect, useState } from "react";

import { fontLibrary } from "@platform";
import type { FontFamily } from "@shared/core";

/** The families, once read (shared by every picker in the session). */
let loaded: FontFamily[] | null = null;

/** The fonts the picker offers (installed, then Google's); `null` while they're being read. */
export function useFontFamilies(): FontFamily[] | null {
  const [families, setFamilies] = useState(loaded);
  useEffect(() => {
    if (loaded) return;
    let active = true;
    void fontLibrary.families().then((list) => {
      loaded = list;
      if (active) setFamilies(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return families;
}
