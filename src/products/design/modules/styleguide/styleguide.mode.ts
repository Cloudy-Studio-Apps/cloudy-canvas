import { Palette } from "lucide-react";

import { defineDesignMode } from "@design/ui/modules";
import {
  STYLEGUIDE_ALLOWED_COMMANDS,
  STYLEGUIDE_MODE_ID,
  STYLEGUIDE_TOOL,
  StyleguideTool,
  styleguideIsolate,
} from "./mode";
import { StyleguideEmpty } from "./ui/empty/styleguide-empty";
import { useStyleguideScope } from "./ui/hooks/use-styleguide-scope";
import { useStyleguideSelection } from "./ui/hooks/use-styleguide-selection";
import { StyleguideSidebar } from "./ui/sidebar/styleguide-sidebar";
import { StyleguideTab } from "./ui/tab/styleguide-tab";
import { t } from "./styleguide.i18n";

/**
 * The Design system mode: the system page's sections (one live element per category) can be
 * pointed at, selected and exported, never edited; the select-only tool and the hand work. Its
 * rail tab, sidebar and empty state; `useStyleguideScope` shows the system page while it's on
 * (and turns it on when someone follows another there), `useStyleguideSelection` follows picks.
 */
export const styleguideMode = defineDesignMode({
  id: STYLEGUIDE_MODE_ID,
  label: t("mode.label"),
  description: t("mode.description"),
  icon: Palette,
  order: 20,
  tool: STYLEGUIDE_TOOL,
  tools: [{ id: STYLEGUIDE_TOOL, create: (ctx) => new StyleguideTool(ctx) }],
  allowTools: ["hand"],
  isolate: styleguideIsolate,
  commands: STYLEGUIDE_ALLOWED_COMMANDS,
  rail: {
    tabs: [
      {
        id: "styleguide",
        label: t("mode.label"),
        icon: Palette,
        component: StyleguideTab,
      },
    ],
  },
  sidebar: StyleguideSidebar,
  overlays: [StyleguideEmpty],
  hooks: [useStyleguideScope, useStyleguideSelection],
});
