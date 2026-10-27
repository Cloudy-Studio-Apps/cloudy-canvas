import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import type { RelayTestRowProps } from "./relay-test.types";
import { t } from "../../settings.i18n";

/** Test connection, with what the last test found. */
export function RelayTestRow({ relay, state, onTest }: RelayTestRowProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!relay || state.status === "testing"}
          onClick={() => relay && onTest(relay)}
        >
          {state.status === "testing" && <LoaderCircle className="animate-spin" />}
          {t("collaboration.test")}
        </Button>
        {state.status === "ok" && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-success" />
            {t("collaboration.connected", { millis: state.millis })}
          </span>
        )}
      </div>
      {state.status === "failed" && (
        <p className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
    </>
  );
}
