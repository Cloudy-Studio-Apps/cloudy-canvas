import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { leafName, stylesOf, variablesOf } from "../template-kit";
import { fontVariableRows } from "./font-variable-rows";
import { styledSample, summaryIn } from "./typography-kit";

/** Each text style set in itself, with its name and size / line height. */
export const scaleTemplate: StyleguideTemplate = {
  id: "typography.scale",
  category: "typography",
  label: "Scale ladder",
  description: "Each text style set in itself, with its name and size / line height.",
  options: [
    {
      id: "sample",
      label: "Sample",
      type: "select",
      default: "fox",
      choices: [
        { value: "fox", label: "The quick brown fox" },
        { value: "name", label: "The style's name" },
        { value: "alphabet", label: "Aa Bb Cc 123" },
      ],
    },
  ],
  build: (group, options, context) => [
    stack(
      "scale",
      "vertical",
      [
        ...stylesOf(group).map((style) =>
          stack(
            `item:${style.id}`,
            "horizontal",
            [
              stack(
                "caption",
                "vertical",
                [
                  label("name", leafName(style), { weight: "600", width: 160 }),
                  label("summary", summaryIn(context, style), {
                    color: SHEET_LOOK.muted,
                    width: 160,
                  }),
                ],
                { gap: 4 },
              ),
              styledSample(
                "sample",
                SAMPLES[String(options.sample)] ?? leafName(style),
                style,
                context,
                {
                  width: 720,
                },
              ),
            ],
            { gap: 32, counterAlign: "center" },
          ),
        ),
        ...fontVariableRows(variablesOf(group), context),
      ],
      { gap: 24 },
    ),
  ],
};

const SAMPLES: Record<string, string> = {
  fox: "The quick brown fox jumps over the lazy dog",
  alphabet: "Aa Bb Cc Dd Ee 0123456789",
};
