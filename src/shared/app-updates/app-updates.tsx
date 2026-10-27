import { useEffect } from "react";

import { useUpdateStore } from "@shared/stores/update-store";
import { UpdatedNotice } from "./updated-notice";
import { UpdateNotice } from "./update-notice";
import { WhatsNewDialog } from "./whats-new-dialog";

/** The first check waits for the app to settle. */
const FIRST_CHECK_MS = 5000;
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

/**
 * Checks for new versions in the background, shows the notices (an update available, the app just
 * updated) and hosts the "What's new" dialog. Mounted once by the app.
 */
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

  return (
    <>
      <UpdateNotice />
      <UpdatedNotice />
      <WhatsNewDialog />
    </>
  );
}
