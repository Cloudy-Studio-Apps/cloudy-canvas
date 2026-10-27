import { PenLine } from "lucide-react";

import { ElementThumbnail } from "@canvas-ui";
import { paperSize } from "../../model/paper-size";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { optionLetter } from "../option-letter";
import { editInDesign, showPage } from "../page-actions";
import type { PageSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/**
 * The selected page: its number, frame and size, the option it prints (picked among its
 * options), and going back to design it or taking it out of the brochure.
 */
export function PageSection({ page }: PageSectionProps) {
  const engine = useDesignEngine();
  const { brochure, label } = useBrochure();
  const paper = paperSize(page.frame);

  return (
    <>
      <PanelSection title={t("page.title", { page: label(page) })}>
        <p className="truncate text-sm text-foreground">{page.frame.name}</p>
        <p className="text-xs text-muted-foreground">
          {paper.name ? `${paper.name} · ` : ""}
          {paper.width} × {paper.height} mm
        </p>
      </PanelSection>
      <PanelSection title={t("page.options")}>
        {page.options.length > 1 ? (
          <ul className="flex flex-col gap-1.5">
            {page.options.map((option, i) => {
              const chosen = option.id === page.frame.id;
              return (
                <li key={option.id}>
                  {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a page option with its thumbnail */}
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => {
                      brochure?.choose(page.slot.id, option.id);
                      showPage(engine, option);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded-card border p-1.5 text-left hover:border-border-strong",
                      chosen && "border-ring bg-primary-soft hover:border-ring",
                    )}
                  >
                    <ElementThumbnail id={option.id} className="h-12 w-17" />
                    <span className="min-w-0 text-xs">
                      <span className="block font-semibold text-foreground">
                        {t("page.option", { letter: optionLetter(i) })}
                      </span>
                      <span className="block truncate text-muted-foreground">{option.name}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("page.oneVersion", { page: label(page) })}
          </p>
        )}
      </PanelSection>
      <div className="flex flex-col gap-1.5 border-b px-3 py-2.5">
        <Button size="sm" variant="outline" onClick={() => editInDesign(engine, page.frame)}>
          <PenLine />
          {t("page.edit")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => brochure?.removePages([page.slot.id])}>
          {t("tab.page.remove")}
        </Button>
      </div>
    </>
  );
}
