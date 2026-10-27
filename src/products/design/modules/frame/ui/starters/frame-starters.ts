import type { DesignStarter } from "../../../core/ui";
import { t } from "../../frame.i18n";
import desktopLandingPreview from "./desktop-landing.svg";
import mobileAppPreview from "./mobile-app.svg";
import { presetFrameStarter } from "./preset-frame-starter";

/** Home's "Mobile app" and "Desktop landing": a design that begins with one frame. */
export const FRAME_STARTERS: readonly DesignStarter[] = [
  presetFrameStarter(
    {
      id: "mobile-app",
      label: t("starters.mobileApp.label"),
      description: t("starters.mobileApp.description"),
      preview: mobileAppPreview,
      order: 10,
    },
    "iphone-16",
  ),
  presetFrameStarter(
    {
      id: "desktop-landing",
      label: t("starters.desktopLanding.label"),
      description: t("starters.desktopLanding.description"),
      preview: desktopLandingPreview,
      order: 20,
    },
    "desktop",
  ),
];
