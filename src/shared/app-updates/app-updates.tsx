import { useEffect } from "react";

import { useUpdateStore } from "@shared/stores/update-store";
import { UpdateNotice } from "./update-notice";

/** The first check waits for the app to settle. */
const FIRST_CHECK_MS = 5000;
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

/** Checks for new versions in the background and shows the notice. Mounted once by the app. */
export function AppUpdates() {
  useEffect(() => {
    const check = () => void useUpdateStore.getState().check({ silent: true });
    const first = setTimeout(check, FIRST_CHECK_MS);
    const every = setInterval(check, CHECK_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);

  return <UpdateNotice />;
}
