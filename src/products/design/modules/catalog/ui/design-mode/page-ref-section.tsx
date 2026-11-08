import type { ElementPatch } from "@canvas";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { SelectField } from "@shared/ui/kit";
import { pageItemTag, pageItemTemplate } from "../../model/page-items/page-item-fields";
import { readPageRef, withPageRef } from "../../model/page-items/page-ref-token";
import { useBrochure } from "../hooks/use-brochure";
import { pageRefOptions } from "./page-ref-options";
import { t } from "../../catalog.i18n";

/**
 * In the properties panel, for a page item with a `{page:…}` (on a master or a page, not its
 * copies): the section or page it points to, from the open brochure's, in one undo step.
 */
export function PageRefSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const { layout, numbers } = useBrochure();
  const node = nodes.length === 1 ? nodes[0] : undefined;
  const template = node && !pageItemTag(node) ? pageItemTemplate(node) : null;
  const current = template === null ? null : readPageRef(template);
  if (!node || template === null || current === null) return null;

  const options = pageRefOptions(layout, numbers);
  // Matched as `{page:Name}` reads it: trimmed and in any case.
  const key = current.trim().toLocaleLowerCase();
  const chosen = options.find((option) => option.value.trim().toLocaleLowerCase() === key);
  if (key && !chosen) {
    options.push({ value: current, label: t("design.pageRef.missing", { name: current }) });
  }
  const choose = (name: string) => {
    engine.doc.checkpoint();
    engine.doc.update(node.id, { catalogText: withPageRef(template, name) } as ElementPatch);
  };

  return (
    <PanelSection title={t("design.pageRef.title")}>
      <SelectField
        label={t("design.pageRef.target")}
        layout="stacked"
        value={chosen?.value ?? current}
        options={options}
        placeholder={t("design.pageRef.placeholder")}
        onChange={choose}
      />
      <p className="mt-1.5 text-xs text-muted-foreground">{t("design.pageRef.hint")}</p>
    </PanelSection>
  );
}
