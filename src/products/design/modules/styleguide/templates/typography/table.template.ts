import type { StyleguideTemplate } from "../../styleguide.types";
import { formatNumber, leafName, stylesOf } from "../template-kit";
import { tableRows } from "../table-rows";
import { textStyleIn } from "./typography-kit";
import { t } from "../../styleguide.i18n";

/** The text styles as a table: name, family, weight, size, line height, letter spacing. */
export const typographyTableTemplate: StyleguideTemplate = {
  id: "typography.table",
  category: "typography",
  label: t("templates.typography.table.label"),
  description: t("templates.typography.table.description"),
  options: [],
  build: (group, _options, context) => [
    tableRows(
      [
        { header: "Style", width: 200 },
        { header: "Family", width: 160 },
        { header: "Weight", width: 80 },
        { header: "Size", width: 80 },
        { header: "Line height", width: 100 },
        { header: "Letter spacing", width: 120 },
      ],
      stylesOf(group).map((style) => {
        const value = textStyleIn(context, style);
        return {
          key: `item:${style.id}`,
          cells: [
            leafName(style),
            value.fontFamily ?? "—",
            value.fontWeight ?? "—",
            value.fontSize === undefined ? "—" : formatNumber(value.fontSize),
            value.lineHeight === undefined ? "Auto" : `${Math.round(value.lineHeight * 100)}%`,
            value.letterSpacing === undefined ? "0" : formatNumber(value.letterSpacing),
          ],
        };
      }),
    ),
  ],
};
