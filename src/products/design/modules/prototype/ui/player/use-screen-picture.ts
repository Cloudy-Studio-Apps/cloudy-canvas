import { useEffect, useState } from "react";

import { notifyError } from "@shared/stores/toast-store";
import type { FrameElement } from "../../../frame";
import type { ScreenPictures } from "./screen-pictures";
import type { LoadedPicture } from "./use-screen-picture.types";
import { t } from "../../prototype.i18n";

/**
 * A screen's picture at `scale` (pixels per world unit): at once when it's drawn already, else once
 * it is; meanwhile the last one drawn for this layer stays (an edited screen, a sharper picture).
 */
export function useScreenPicture(
  pictures: ScreenPictures,
  screen: FrameElement,
  scale: number,
): string | null {
  const known = pictures.known(screen, scale);
  const [loaded, setLoaded] = useState<LoadedPicture | null>(null);
  useEffect(() => {
    if (pictures.known(screen, scale)) return;
    let live = true;
    pictures.load(screen, scale).then(
      (url) => {
        if (live) setLoaded({ screen: screen.id, url });
      },
      (error: unknown) => {
        if (live) notifyError(t("player.drawFailed"), error);
      },
    );
    return () => {
      live = false;
    };
  }, [pictures, screen, scale]);
  return known ?? (loaded?.screen === screen.id ? loaded.url : null);
}
