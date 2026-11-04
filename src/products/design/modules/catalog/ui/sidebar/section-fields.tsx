import { Bookmark, BookmarkPlus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { placeSections, sectionLabel, startLevels } from "../../model/sections";
import { useBrochure } from "../hooks/use-brochure";
import { startSection } from "../section-actions";
import { SectionCard } from "./section-card";
import type { SectionFieldsProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/**
 * The sections starting at the page (`SectionCard` each, outermost first), the sections it's
 * in otherwise, and starting a section or a subsection there (`startLevels`).
 */
export function SectionFields({ page }: SectionFieldsProps) {
  const { brochure, sections, numbers, layout } = useBrochure();
  if (!brochure) return null;
  const slots = brochure.record()?.slots ?? [];
  const starting = placeSections(sections, slots).filter(
    (placed) => placed.section.start === page.slot.id,
  );
  const levels = startLevels(sections, slots, page.slot.id);
  const side = layout.sides.findIndex(
    (item) => item.kind === "page" && item.page.slot.id === page.slot.id,
  );
  const path = numbers[side]?.path ?? [];

  return (
    <div className="flex flex-col gap-2">
      {starting.map(({ section, depth }) => (
        <SectionCard key={section.id} section={section} depth={depth} side={side} />
      ))}
      {starting.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {path.length > 0
            ? t("section.in", { name: sectionLabel(path, "all") })
            : t("section.none")}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {levels.section !== null && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => startSection(brochure, page.slot.id, levels.section ?? 0)}
          >
            <Bookmark />
            {t("section.start")}
          </Button>
        )}
        {levels.subsection !== null && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => startSection(brochure, page.slot.id, levels.subsection ?? 1)}
          >
            <BookmarkPlus />
            {t("section.startSub")}
          </Button>
        )}
      </div>
    </div>
  );
}
