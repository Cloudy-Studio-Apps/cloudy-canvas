import type { ImageQuality, Size } from "@canvas";
import type { ImageQualityText } from "./image-quality-note.types";
import { t } from "../components.i18n";

function dimensions({ w, h }: Size): string {
  return `${Math.round(w)} × ${Math.round(h)}`;
}

/** What the note says about a picture's quality: a line, an optional second one and a tooltip. */
export function imageQualityText(quality: ImageQuality): ImageQualityText | null {
  const { natural, shown, vector, onScreen } = quality;
  if (!shown) return null;
  const now =
    onScreen === null ? t("quality.outOfView") : t("quality.nowOnScreen", { px: onScreen });
  const exports = vector
    ? t("quality.exportsVector")
    : t("quality.exportsRaster", { size: dimensions(natural) });
  const detail = onScreen === null ? null : t("quality.onScreen", { px: onScreen });
  if (vector) {
    return {
      label: t("quality.vectorLabel", { size: dimensions(shown) }),
      detail,
      tooltip: t("quality.vectorTip", { now, exports }),
    };
  }
  const full = Math.max(shown.w, shown.h) >= Math.max(natural.w, natural.h) - 1;
  if (full) {
    return {
      label: t("quality.fullLabel", { size: dimensions(natural) }),
      detail: null,
      tooltip: t("quality.fullTip", { size: dimensions(natural) }),
    };
  }
  return {
    label: t("quality.previewLabel", { shown: dimensions(shown), natural: dimensions(natural) }),
    detail,
    tooltip: t("quality.previewTip", { now, exports }),
  };
}
