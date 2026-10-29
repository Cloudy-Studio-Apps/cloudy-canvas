import { SealLogo } from "@shared/ui/brand/seal-logo";
import { t } from "../../viewer.i18n";
import type { ViewerErrorProps } from "./viewer-error.types";

/** What the viewer shows instead of the board when it can't open it. */
export function ViewerError({ reason }: ViewerErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <SealLogo size={64} />
      <p className="max-w-md text-sm text-muted-foreground">{t(`error.${reason}`)}</p>
    </div>
  );
}
