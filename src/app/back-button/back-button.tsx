import { useEffect } from "react";

import { leaveApp, onBackButton } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";
import { router } from "../router";
import { closeOpenLayer } from "./close-open-layer";

/**
 * Android's back button: closes what's open on top, else goes back to Home, else leaves the app.
 * Leaving an editor saves what's pending, as its back arrow does. Renders nothing.
 */
export function BackButton() {
  useEffect(
    () =>
      onBackButton(() => {
        if (closeOpenLayer()) return;
        if (router.state.location.pathname !== "/") void router.navigate("/");
        else leaveApp().catch((error: unknown) => notifyError(t("leave.failed"), error));
      }),
    [],
  );
  return null;
}
