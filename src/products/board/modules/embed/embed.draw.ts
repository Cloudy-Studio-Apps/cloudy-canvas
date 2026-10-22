import type { ElementView } from "@canvas";

import {
  EMBED_CARD_COLOR,
  EMBED_PREVIEW_COLOR,
  INK_COLOR,
  MUTED_INK_COLOR,
  PAPER_SHADOW_COLOR,
} from "../../palette";
import { EMBED_DEFAULTS } from "./embed.defaults";
import { EMBED_ICONS } from "./embed-icons";
import { embedLayout } from "./embed.layout";
import type { EmbedElement } from "./embed.types";
import { truncateText } from "./truncate-text";

const { radius, titleSize, siteSize, playRadius } = EMBED_DEFAULTS;
const TEXT_X = 16;
const SITE_MARK = 14;
/** Titles are semibold but measured regular, so they get a little extra room. */
const BOLD_MARGIN = 0.94;
const PLAY_LAYER = "embed-play";

export function drawEmbed(view: ElementView, el: EmbedElement): void {
  const layout = embedLayout(el);
  const g = view.graphics.clear();

  g.roundRect(0, 2, el.w, el.h, radius).fill({ color: PAPER_SHADOW_COLOR, alpha: 0.06 });
  g.roundRect(0, 0, el.w, el.h, radius)
    .fill({ color: EMBED_CARD_COLOR })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.14, width: 1, alignment: 1 });

  const { preview, play, footer, open } = layout;
  if (preview) {
    g.roundRect(preview.x, preview.y, preview.w, preview.h, radius - 2).fill({
      color: EMBED_PREVIEW_COLOR,
    });
  }
  if (preview && el.imageId) view.placeImage(el.imageId, preview, "cover");
  else view.clearImage();

  // The play button is drawn on a second layer so it stays above the picture.
  const top = view.layer(PLAY_LAYER);
  top.clear();
  if (play) {
    top.circle(play.x, play.y, playRadius).fill({ color: EMBED_CARD_COLOR, alpha: 0.94 });
    const s = playRadius * 0.42;
    top
      .poly([play.x - s * 0.7, play.y - s, play.x - s * 0.7, play.y + s, play.x + s, play.y])
      .fill({ color: INK_COLOR });
  }

  const textWidth = open.x - TEXT_X - 12;
  const title = view.setTextSlot(
    "title",
    truncateText(el.title, titleSize, textWidth * BOLD_MARGIN),
    { fontSize: titleSize, color: INK_COLOR, fontWeight: "600" },
  );
  title.position.set(TEXT_X, footer.y + 13);

  const siteY = footer.y + 40;
  const siteIcon = el.provider === "youtube" ? EMBED_ICONS.youtube : EMBED_ICONS.globe;
  view.placeIcon("site", siteIcon, {
    x: TEXT_X,
    y: siteY - SITE_MARK / 2,
    w: SITE_MARK,
    h: SITE_MARK,
  });
  const site = view.setTextSlot(
    "site",
    truncateText(siteLabel(el), siteSize, textWidth - SITE_MARK - 6),
    { fontSize: siteSize, color: MUTED_INK_COLOR },
  );
  site.position.set(TEXT_X + SITE_MARK + 6, siteY - site.height / 2);

  g.roundRect(open.x, open.y, open.w, open.h, 4).stroke({
    color: PAPER_SHADOW_COLOR,
    alpha: 0.18,
    width: 1,
  });
  const inset = open.w * 0.22;
  view.placeIcon("open", EMBED_ICONS.open, {
    x: open.x + inset,
    y: open.y + inset,
    w: open.w - inset * 2,
    h: open.h - inset * 2,
  });
}

function siteLabel(el: EmbedElement): string {
  if (el.status === "loading") return `${el.siteName} · Loading preview…`;
  return el.siteName;
}
