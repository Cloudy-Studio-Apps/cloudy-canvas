import { resolveVariable } from "@canvas";

import { modeColumns } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { COLOR_OPTIONS, COLUMNS_OPTION } from "./color-kit";
import { swatchGrid } from "./swatch-grid.template";
import { withDefaults } from "../template-kit";

/** The swatch grid once per mode, side by side, whatever the element's own mode view. */
export const modeColumnsTemplate: StyleguideTemplate = {
  id: "colors.mode-columns",
  category: "colors",
  label: "Mode columns",
  description: "Every mode side by side: the swatch grid per mode.",
  options: withDefaults([...COLOR_OPTIONS, COLUMNS_OPTION], { swatch: 64, columns: 4 }),
  build: (group, options, context) =>
    modeColumns(group, context.store, context.modes, (modes) =>
      swatchGrid(group, options, {
        ...context,
        modes,
        resolve: (id) => resolveVariable(context.store, id, modes),
      }),
    ),
};
