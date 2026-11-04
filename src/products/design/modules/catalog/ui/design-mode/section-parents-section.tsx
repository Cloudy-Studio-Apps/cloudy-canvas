import type { ElementPatch } from "@canvas";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { SelectField } from "@shared/ui/kit";
import { pageItemTag, pageItemTemplate } from "../../model/page-items/page-item-fields";
import {
  SECTION_JOIN,
  templateSectionParents,
  withSectionParents,
  type SectionParents,
} from "../../model/sections";
import { t } from "../../catalog.i18n";

/** The parents offered; a number written by hand that isn't listed is added. */
const OFFERED: readonly SectionParents[] = [0, 1, 2, 3, "all"];

function choiceLabel(parents: SectionParents): string {
  if (parents === "all") return t("design.sectionParents.all");
  if (parents === 0) return t("design.sectionParents.own");
  if (parents === 1) return t("design.sectionParents.one");
  return t("design.sectionParents.many", { n: parents });
}

/**
 * In the properties panel, for page items that write `{section}` (on a master or a page, not
 * its copies): how many of the sections it's in they write before it ("Túneles › Shotcrete"),
 * in one undo step.
 */
export function SectionParentsSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const items = nodes.flatMap((node) => {
    const template = pageItemTemplate(node);
    const parents = template === null ? null : templateSectionParents(template);
    return template !== null && parents !== null && !pageItemTag(node)
      ? [{ id: node.id, template, parents }]
      : [];
  });
  const first = items[0];
  if (!first) return null;
  const choices = OFFERED.includes(first.parents) ? OFFERED : [...OFFERED, first.parents];
  const options = choices.map((parents) => ({
    value: String(parents),
    label: choiceLabel(parents),
  }));
  const choose = (value: string) => {
    const parents: SectionParents = value === "all" ? "all" : Number(value);
    const patches = new Map<string, ElementPatch>(
      items.map(({ id, template }) => [
        id,
        { catalogText: withSectionParents(template, parents) } as ElementPatch,
      ]),
    );
    engine.doc.checkpoint();
    engine.doc.updateMany(patches);
  };

  return (
    <PanelSection title={t("design.sectionParents.title")}>
      <SelectField
        label={t("design.sectionParents.label")}
        layout="stacked"
        value={String(first.parents)}
        options={options}
        onChange={choose}
      />
      <p className="mt-1.5 text-xs text-muted-foreground">
        {t("design.sectionParents.hint", { join: SECTION_JOIN.trim() })}
      </p>
    </PanelSection>
  );
}
