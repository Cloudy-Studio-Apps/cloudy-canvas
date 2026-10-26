import { label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { GeneratedSpec, StyleguideTemplate } from "../../styleguide.types";
import { contrastGrade, contrastRatio } from "../../tokens";
import { colorOf, fontOf, leafName, variablesOf } from "../template-kit";
import { hexOf } from "./color-text";

const WHITE = "#FFFFFFFF";
const BLACK = "#000000FF";

/** Which text colors each color is checked against. */
const PAIRS: Record<string, readonly string[]> = {
  "white-black": [WHITE, BLACK],
  white: [WHITE],
  black: [BLACK],
};

/** A sample of `text` color on the color, with its contrast ratio and WCAG grade. */
function sample(key: string, text: string, on: string, font: string): GeneratedSpec {
  const ratio = contrastRatio(text, on);
  return stack(
    key,
    "horizontal",
    [
      label("aa", "Aa", { font, size: 20, weight: "700", color: text.slice(0, 7) }),
      label("ratio", `${ratio.toFixed(2)} · ${contrastGrade(ratio)}`, {
        font,
        color: text.slice(0, 7),
      }),
    ],
    { gap: 8, counterAlign: "center" },
  );
}

/** Each color with text on it in white and black, the contrast ratio and the WCAG grade. */
export const contrastPairsTemplate: StyleguideTemplate = {
  id: "colors.contrast-pairs",
  category: "colors",
  label: "Pairs with contrast",
  description: "Text on each color, with its contrast ratio and WCAG grade.",
  options: [
    {
      id: "pairWith",
      label: "Text in",
      type: "select",
      default: "white-black",
      choices: [
        { value: "white-black", label: "White and black" },
        { value: "white", label: "White" },
        { value: "black", label: "Black" },
      ],
    },
    { id: "font", label: "Label font", type: "font", default: SHEET_LOOK.font },
  ],
  build: (group, options, context) => {
    const font = fontOf(options);
    const texts = PAIRS[String(options.pairWith)] ?? PAIRS["white-black"]!;
    return [
      stack(
        "pairs",
        "vertical",
        variablesOf(group).map((variable) => {
          const color = colorOf(context, variable.id);
          const tile = stack(
            "tile",
            "vertical",
            texts.map((text, i) => sample(`sample:${i}`, text, color, font)),
            {
              gap: 8,
              padding: 16,
              name: leafName(variable),
              ...solidFill(color),
              sizing: { h: "fixed", v: "hug" },
              w: 240,
            },
          );
          return stack(
            `item:${variable.id}`,
            "horizontal",
            [
              { ...tile, bindings: { "fills.0.color": variable.id } },
              stack(
                "caption",
                "vertical",
                [
                  label("name", leafName(variable), { font, weight: "600" }),
                  label("hex", hexOf(color), { font, color: SHEET_LOOK.muted }),
                ],
                { gap: 4 },
              ),
            ],
            { gap: 16, counterAlign: "center" },
          );
        }),
        { gap: 12 },
      ),
    ];
  },
};
