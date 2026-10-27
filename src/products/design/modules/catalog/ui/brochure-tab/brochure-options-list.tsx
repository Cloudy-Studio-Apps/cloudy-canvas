import { ElementThumbnail } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { optionLetter } from "../option-letter";
import { showPage } from "../page-actions";
import type { BrochureOptionsListProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/** A page's options under its row: picking one prints it instead. */
export function BrochureOptionsList({ page }: BrochureOptionsListProps) {
  const engine = useDesignEngine();
  const { brochure, label } = useBrochure();
  return (
    <ul
      aria-label={t("tab.options.label", { page: label(page) })}
      className="mt-0.5 mb-1.5 ml-7 border-l pl-1.5"
    >
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
                "flex w-full cursor-pointer items-center gap-1.5 rounded-sm px-1 py-0.5 text-left text-xs text-muted-foreground hover:bg-hover hover:text-foreground",
                chosen && "font-medium text-foreground",
              )}
            >
              <span
                className={cn(
                  "size-3 shrink-0 rounded-full border-[1.5px] border-border-strong",
                  chosen && "border-4 border-primary",
                )}
              />
              <ElementThumbnail id={option.id} className="h-7 w-10" />
              <span className="truncate">
                {optionLetter(i)} · {option.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
