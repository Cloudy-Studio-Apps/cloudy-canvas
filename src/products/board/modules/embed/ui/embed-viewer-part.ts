import { defineViewerPart } from "../../viewer/ui";
import type { EmbedElement } from "../embed.types";

/** Link cards in the HTML viewer: a click opens the link in a new tab. */
export const embedViewerPart = defineViewerPart<null>({
  id: "embed",
  types: ["embed"],
  collect: () => null,
  click: (el) => {
    window.open((el as EmbedElement).url, "_blank", "noopener");
  },
});
