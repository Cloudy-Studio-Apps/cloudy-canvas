import { ContinueCard } from "./continue-card";
import { CreateColumn } from "./create-column";
import type { ContinueSectionProps } from "./continue-section.types";
import { t } from "../home.i18n";

/** How many recent files are listed under the Continue card. */
const NEXT_SHOWN = 3;

/** The top of Home with files: the Continue card and, beside it, the create column. */
export function ContinueSection({ hero, next, kindOf, onOpen, ...create }: ContinueSectionProps) {
  return (
    <section aria-labelledby="continue-heading" className="space-y-4">
      <h1 id="continue-heading" className="text-sm font-medium tracking-wide text-muted-foreground">
        {hero ? t("continue.title") : t("create.label")}
      </h1>
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        {hero ? (
          <ContinueCard
            file={hero}
            next={next.slice(0, NEXT_SHOWN)}
            kindOf={kindOf}
            onOpen={onOpen}
          />
        ) : (
          <div className="hidden md:block" />
        )}
        <CreateColumn {...create} />
      </div>
    </section>
  );
}
