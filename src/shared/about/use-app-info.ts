import { useEffect, useState } from "react";

import { appInfo } from "@platform";
import type { AppInfo } from "@shared/core";

/** The app's version and build, once read (`null` until then). */
export function useAppInfo(): AppInfo | null {
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    let active = true;
    appInfo().then(
      (value) => active && setInfo(value),
      (error: unknown) => console.error("[about] Couldn't read the app version:", error),
    );
    return () => {
      active = false;
    };
  }, []);

  return info;
}
