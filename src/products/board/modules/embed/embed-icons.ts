import { ExternalLink, Globe, type IconNode } from "lucide";

import { MUTED_INK_COLOR, YOUTUBE_RED } from "../../palette";

/** YouTube's logo on a 24-unit grid (from Simple Icons, CC0). */
export const YOUTUBE_LOGO_PATH =
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

/** A Lucide icon as SVG markup in one color (Lucide's 24-unit grid, stroked). */
function lucideSvg(node: IconNode, color: string, strokeWidth = 2): string {
  const style = `fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
  const children = node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([name, value]) => `${name}="${String(value)}"`)
        .join(" ");
      return `<${tag} ${attributes} ${style}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${children}</svg>`;
}

/** Icons drawn on link cards, as SVG markup on a 24-unit grid. */
export const EMBED_ICONS = {
  /** YouTube's logo (Simple Icons). */
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${YOUTUBE_LOGO_PATH}" fill="${YOUTUBE_RED}"/></svg>`,
  globe: lucideSvg(Globe, MUTED_INK_COLOR),
  open: lucideSvg(ExternalLink, MUTED_INK_COLOR),
} as const;
