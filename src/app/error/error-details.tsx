import { ChevronRight } from "lucide-react";

import { isOwnFrame } from "./describe-error";
import type { ErrorDetailsProps } from "./error-details.types";
import { t } from "./error.i18n";

/** The error's message and stack, folded away. Development builds only. */
export function ErrorDetails({ error, version }: ErrorDetailsProps) {
  const route = window.location.pathname;

  return (
    <details className="group w-full min-w-0 rounded-lg border bg-surface text-left">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
        {t("details.title")}
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-normal text-muted-foreground">
          {error.message}
        </span>
      </summary>
      <div className="grid gap-2.5 border-t px-3.5 pt-3 pb-3.5">
        <p className="font-mono text-xs break-all text-destructive">{error.message}</p>
        {error.frames.length > 0 && (
          <pre className="overflow-x-auto rounded-md bg-surface-sunken px-3 py-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
            {error.frames.map((frame, i) => (
              <div
                key={i}
                className={isOwnFrame(frame) ? "font-medium text-foreground" : undefined}
              >
                {frame}
              </div>
            ))}
          </pre>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono">
            {version} · {route}
          </span>
          <span>{t("details.ownFrames")}</span>
        </div>
      </div>
    </details>
  );
}
