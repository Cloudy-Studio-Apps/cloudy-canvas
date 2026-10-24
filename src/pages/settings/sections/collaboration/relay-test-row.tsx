import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import type { RelayTestRowProps } from "./relay-test.types";

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
          Test connection
        </Button>
        {state.status === "ok" && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-success" />
            Connected through the relay in {state.millis} ms
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
