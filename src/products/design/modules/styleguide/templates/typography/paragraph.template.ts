import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { leafName, stylesOf } from "../template-kit";
import { styledSample, summaryIn } from "./typography-kit";

const PARAGRAPH =
  "Design systems keep a product consistent: the same colors, type and spacing everywhere, " +
  "named once and used by reference, so a change in one place reaches every screen.";

/** A paragraph set in each text style. */
export const paragraphTemplate: StyleguideTemplate = {
  id: "typography.paragraph",
  category: "typography",
  label: "Paragraph sample",
  description: "A paragraph set in each style, to judge how it reads.",
  options: [
    { id: "width", label: "Width", type: "number", default: 480, min: 200, max: 1200, step: 20 },
  ],
  build: (group, options, context) => [
    stack(
      "paragraphs",
      "vertical",
      stylesOf(group).map((style) =>
        stack(
          `item:${style.id}`,
          "vertical",
          [
            label("name", `${leafName(style)} · ${summaryIn(context, style)}`, {
              color: SHEET_LOOK.muted,
            }),
            styledSample("sample", PARAGRAPH, style, context, { width: Number(options.width) }),
          ],
          { gap: 8 },
        ),
      ),
      { gap: 32 },
    ),
  ],
};
