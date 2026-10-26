import { label, SHEET_LOOK } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";

/** The file's title only. */
export const coverMinimalTemplate: StyleguideTemplate = {
  id: "cover.minimal",
  category: "cover",
  label: "Minimal",
  description: "The file's title, nothing else.",
  options: [{ id: "font", label: "Font", type: "font", default: SHEET_LOOK.font }],
  build: (_group, options, context) => [
    label("title", context.meta.title || "Design system", {
      size: 48,
      weight: "700",
      font: String(options.font),
    }),
  ],
};
