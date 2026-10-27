import { SealLogo } from "@shared/ui/brand/seal-logo";
import { SealsVideo } from "@shared/ui/brand/seals-video";
import { CreateTiles } from "./create-tiles";
import type { WelcomeProps } from "./welcome.types";
import { t } from "../home.i18n";

/** Home before there's any file: what the app makes, the three ways to start, and the seals. */
export function Welcome({ onCreate }: WelcomeProps) {
  return (
    <section
      aria-labelledby="welcome-heading"
      className="grid items-center gap-8 rounded-card border bg-surface p-6 shadow-soft sm:p-8 lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="space-y-4">
        <SealLogo size={44} />
        <div className="space-y-1.5">
          <h1 id="welcome-heading" className="text-3xl font-semibold tracking-tight">
            {t("welcome.title")}
          </h1>
          <p className="text-muted-foreground">{t("welcome.tagline")}</p>
        </div>
        <div className="flex flex-col gap-2.5 pt-2">
          <CreateTiles onCreate={onCreate} detailed />
        </div>
        <p className="text-xs text-muted-foreground">{t("welcome.drop")}</p>
      </div>
      <div className="aspect-[16/10] overflow-hidden rounded-card border bg-surface-sunken">
        <SealsVideo playing />
      </div>
    </section>
  );
}
