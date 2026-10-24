import type { StickerDef } from "../sticker-catalog.types";
import { stickerSvg, svgDataUrl } from "../sticker-svg";
import { COMMON_ART } from "./common-art";

function common(name: string, label: string, keywords: string[], art: string): StickerDef {
  return {
    id: `common:${name}`,
    label,
    keywords,
    url: svgDataUrl(stickerSvg(art)),
    restyle: (look) => stickerSvg(art, "", look),
  };
}

/** Everyday reaction stamps. They're also the wheel's slots until other stickers get used. */
export const COMMON_STICKERS: readonly StickerDef[] = [
  common("heart", "Heart", ["love", "like"], COMMON_ART.heart),
  common("thumbs-up", "Thumbs up", ["yes", "agree", "like", "ok"], COMMON_ART.thumbsUp),
  common("plus-one", "Plus one", ["+1", "vote", "agree", "me too"], COMMON_ART.plusOne),
  common("star", "Star", ["favorite", "great", "best"], COMMON_ART.star),
  common("question", "Question", ["?", "ask", "unclear"], COMMON_ART.question),
  common("thumbs-down", "Thumbs down", ["no", "disagree", "dislike"], COMMON_ART.thumbsDown),
  common("check", "Check", ["done", "yes", "approved"], COMMON_ART.check),
  common("fire", "Fire", ["hot", "lit", "trending"], COMMON_ART.fire),
];
