import type { ImageQuality, Size } from "@canvas";
import type { ImageQualityText } from "./image-quality-note.types";

function dimensions({ w, h }: Size): string {
  return `${Math.round(w)} × ${Math.round(h)}`;
}

/** What the note says about a picture's quality: a line, an optional second one and a tooltip. */
export function imageQualityText(quality: ImageQuality): ImageQualityText | null {
  const { natural, shown, vector, onScreen } = quality;
  if (!shown) return null;
  const now =
    onScreen === null
      ? "It's out of view now."
      : `Right now it takes about ${onScreen} px on screen.`;
  const exports = vector
    ? "Exports and Catalog mode's preview and PDF draw it as sharp as they need."
    : `Exports and Catalog mode's preview and PDF draw from the original at full quality (${dimensions(natural)} px).`;
  if (vector) {
    return {
      label: `Vector picture · drawn at ${dimensions(shown)} px`,
      detail: onScreen === null ? null : `On screen ≈ ${onScreen} px`,
      tooltip: `A vector picture is drawn on the canvas only as sharp as it shows, to keep the canvas fast. ${now} Zoom in and it's drawn sharper. ${exports}`,
    };
  }
  const full = Math.max(shown.w, shown.h) >= Math.max(natural.w, natural.h) - 1;
  if (full) {
    return {
      label: `Full resolution · ${dimensions(natural)} px`,
      detail: null,
      tooltip: `The canvas shows this picture at its own size, ${dimensions(natural)} px. Exports and Catalog mode use it at full quality too.`,
    };
  }
  return {
    label: `Preview ${dimensions(shown)} of ${dimensions(natural)} px`,
    detail: onScreen === null ? null : `On screen ≈ ${onScreen} px`,
    tooltip: `To keep the canvas fast, it shows a smaller copy of this picture, as sharp as the picture looks on screen. ${now} Zoom in and a sharper copy loads. ${exports}`,
  };
}
