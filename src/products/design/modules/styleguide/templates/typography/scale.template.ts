import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { leafName, stylesOf, variablesOf } from "../template-kit";
import { fontVariableRows } from "./font-variable-rows";
import { styledSample, summaryIn } from "./typography-kit";
import { t } from "../../styleguide.i18n";

/** Each text style set in itself, with its name and size / line height. */
export const scaleTemplate: StyleguideTemplate = {
  id: "typography.scale",
  category: "typography",
  label: t("templates.typography.scale.label"),
  description: t("templates.typography.scale.description"),
  options: [
    {
      id: "sample",
      label: t("templates.typography.scale.sample"),
      type: "select",
      default: "fox",
      choices: [
        { value: "fox", label: t("templates.typography.scale.fox") },
        { value: "name", label: t("templates.typography.scale.name") },
        { value: "alphabet", label: t("templates.typography.scale.alphabet") },
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
