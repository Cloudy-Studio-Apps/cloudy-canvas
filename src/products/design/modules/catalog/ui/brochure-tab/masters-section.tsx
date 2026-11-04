import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { PanelAddButton, PanelIconButton } from "@design/ui/components/panel";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { MasterRow } from "./master-row";
import { t } from "../../catalog.i18n";

/**
 * The brochure's masters, above its pages (folds away): each with its two sides, "+" adds one
 * (its frames go above the design page's layers, and the first is the default).
 */
export function MastersSection() {
  const { brochure, masters, settings } = useBrochure();
  const selection = useCatalogSelection();
  const [open, setOpen] = useState(true);
  if (!brochure) return null;
  const selected = selection.kind === "master" ? selection.master.id : null;

  return (
    <section className="shrink-0 border-b pb-1">
      <header className="flex h-9 items-center justify-between pr-3 pl-1.5">
        <h2 className="flex items-center gap-0.5 text-xs font-semibold text-foreground">
          <PanelIconButton
            label={open ? t("masters.hide") : t("masters.show")}
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronDown /> : <ChevronRight />}
          </PanelIconButton>
          {t("masters.title")}{" "}
          <span className="font-normal text-muted-foreground">{masters.length}</span>
        </h2>
        <PanelAddButton label={t("masters.add")} onClick={() => brochure.masters.add()} />
      </header>
      {open &&
        (masters.length === 0 ? (
          <p className="px-3 pb-1.5 text-xs text-muted-foreground">{t("masters.empty")}</p>
        ) : (
          <ul aria-label={t("masters.title")} className="flex flex-col px-1.5">
            {masters.map((master) => (
              <MasterRow
                key={master.id}
                master={master}
                isDefault={master.id === settings.defaultMaster}
                selected={master.id === selected}
              />
            ))}
          </ul>
        ))}
    </section>
  );
}
