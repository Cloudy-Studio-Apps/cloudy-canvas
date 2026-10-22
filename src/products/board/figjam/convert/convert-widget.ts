import { createEmbed } from "../../modules";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { nodeRect } from "./node-rect";

/**
 * A widget: a link preview becomes a link card (which loads its preview again); other widgets
 * are left out. What a widget draws (its own layers) is never converted.
 */
export const convertWidget: FigJamNodeConverter = (node, placement) => {
  const { ctx, out } = placement;
  const url = linkOf(node.linkPreviewData?.url);
  if (!url) {
    const name = node.widgetMetadata?.widgetName ?? "widget";
    return ctx.warnings.add(`“${name}” widgets were left out`);
  }
  const rect = nodeRect(node, placement);
  const embed = createEmbed(url, { x: rect.x, y: rect.y }, "", rect.w);
  ctx.place(node, embed.id);
  out.add(embed);
};

function linkOf(encoded: string | undefined): URL | null {
  if (!encoded) return null;
  try {
    const url = new URL(decodeURIComponent(encoded));
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
