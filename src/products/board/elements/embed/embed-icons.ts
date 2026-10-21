import { ExternalLink, Globe, type IconNode } from "lucide";
import { siYoutube } from "simple-icons";

import { MUTED_INK_COLOR, YOUTUBE_RED } from "../../palette";

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
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${siYoutube.path}" fill="${YOUTUBE_RED}"/></svg>`,
  globe: lucideSvg(Globe, MUTED_INK_COLOR),
  open: lucideSvg(ExternalLink, MUTED_INK_COLOR),
} as const;
