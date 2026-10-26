import { label, solidFill, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { luminance } from "../../tokens";
import { colorOf, fontOf, leafName, variablesOf } from "../template-kit";
import { hexOf } from "./color-text";
import { COLOR_OPTIONS, swatchSize } from "./color-kit";

/** Tall bands side by side (Adobe Color's look), the name and hex inside each at the bottom. */
export const stripesTemplate: StyleguideTemplate = {
  id: "colors.stripes",
  category: "colors",
  label: "Stripes",
  description: "Tall bands side by side, labelled inside.",
  options: COLOR_OPTIONS.filter((option) => option.type !== "boolean" || option.id === "showHex"),
  build: (group, options, context) => {
    const size = swatchSize(options);
    return [
      stack(
        "stripes",
        "horizontal",
        variablesOf(group).map((variable) => {
          const color = colorOf(context, variable.id);
          const ink = luminance(color) > 0.4 ? "#1F2328" : "#FFFFFF";
          const font = fontOf(options);
          const band = stack(
            `item:${variable.id}`,
            "vertical",
            [
              label("name", leafName(variable), {
                font,
                weight: "600",
                color: ink,
                width: size - 24,
              }),
              ...(options.showHex
                ? [label("hex", hexOf(color), { font, color: ink, width: size - 24 })]
                : []),
            ],
            {
              gap: 4,
              padding: 12,
              align: "end",
              name: leafName(variable),
              ...solidFill(color),
              sizing: { h: "fixed", v: "fixed" },
              w: size,
              h: size * 3,
            },
          );
          // The band is the swatch: its fill follows the variable.
          return { ...band, bindings: { "fills.0.color": variable.id } };
        }),
        { gap: 0 },
      ),
    ];
  },
};
