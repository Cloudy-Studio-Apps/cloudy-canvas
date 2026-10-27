import type { BoardStarter } from "../../../core/ui";
import { createSticky, type StickyElement } from "../../../sticky";
import { SECTION_COLORS, STICKY_COLORS } from "../../../../palette";
import { createSection } from "../../section.factory";
import { t } from "../../section.i18n";
import preview from "./retro.svg";

const SECTION_W = 480;
const SECTION_H = 600;
const GAP = 48;

/** The three columns: their title, the question on their first sticky, and colors. */
const COLUMNS = [
  { key: "wentWell", section: SECTION_COLORS[2].value, sticky: STICKY_COLORS[3].value },
  { key: "toImprove", section: SECTION_COLORS[4].value, sticky: STICKY_COLORS[1].value },
  { key: "actions", section: SECTION_COLORS[1].value, sticky: STICKY_COLORS[2].value },
] as const;

/** Home's "Retrospective": Went well, To improve and Actions, each with a sticky to start. */
export const retroStarter: BoardStarter = {
  id: "retro",
  label: t("starters.retro.label"),
  description: t("starters.retro.description"),
  preview,
  order: 30,
  start: (engine) => {
    const { doc } = engine;
    const indexes = doc.nextIndexes(COLUMNS.length * 2);
    doc.batch(() => {
      COLUMNS.forEach((column, i) => {
        const x = i * (SECTION_W + GAP);
        const rect = { x, y: 0, w: SECTION_W, h: SECTION_H };
        const title = t(`starters.retro.${column.key}.title`);
        doc.add(createSection(rect, title, column.section, indexes[i] ?? doc.nextIndex()));
        const sticky: StickyElement = {
          ...createSticky(
            { x: x + SECTION_W / 2, y: 180 },
            column.sticky,
            indexes[COLUMNS.length + i] ?? doc.nextIndex(),
          ),
          text: t(`starters.retro.${column.key}.prompt`),
        };
        doc.add(sticky);
      });
    });
    engine.zoomToFit();
  },
};
