import { Button } from "@shared/ui/kit";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { detachCopies } from "../../model/page-items/detach-copies";
import { pageItemTag } from "../../model/page-items/page-item-fields";
import { useMasterOf } from "./use-master-of";
import { t } from "../../catalog.i18n";

/**
 * In the properties panel, for a brochure master's copies: where they come from, Edit master
 * (selects the master layer) and Detach (they become the page's own layers).
 */
export function FromMasterSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const copies = nodes.filter((node) => pageItemTag(node));
  const from = useMasterOf(copies[0]);
  if (!from) return null;
  return (
    <PanelSection title={t("design.section.title")}>
      <p className="text-xs text-muted-foreground">
        {t("design.section.body", { master: from.master, brochure: from.brochure })}
      </p>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" variant="secondary" onClick={() => engine.focusElement(from.source)}>
          {t("design.section.edit")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            detachCopies(
              engine.doc,
              copies.map((node) => node.id),
            )
          }
        >
          {t("design.section.detach")}
        </Button>
      </div>
    </PanelSection>
  );
}
