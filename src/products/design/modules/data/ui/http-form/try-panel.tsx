import { useEffect, useRef, useState } from "react";
import { CircleAlert, Database, Loader2, Play } from "lucide-react";

import { tCommon } from "@shared/core";
import { Button } from "@shared/ui/kit";
import type { PreviewResult } from "../../update";
import { readAnsweredMessage } from "../../update";
import { t } from "../../data.i18n";
import { errorText } from "../data-tab/error-text";
import { fromDraft } from "./connection-draft";
import type { TryPanelProps } from "./try-panel.types";
import { TryResult } from "./try-result";
import { urlParts } from "./url-parts";

/** What a failure means, in plain words, from the site's answer when there is one. */
function failureTitle(message: string): string {
  const status = Number(readAnsweredMessage(message)?.status ?? 0);
  if (status === 401 || status === 403) return t("connection.try.notAllowed");
  if (status === 404) return t("connection.try.notFound");
  if (status >= 500) return t("connection.try.siteProblem");
  return t("connection.try.failed");
}

/** Try it: runs the draft once (nothing saved) and shows what came back, or why not. */
export function TryPanel({ draft, onPreview, rowsPath, onRowsPath }: TryPanelProps) {
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [running, setRunning] = useState<AbortController | null>(null);
  const latest = useRef<AbortController | null>(null);
  useEffect(() => () => latest.current?.abort(), []);

  const run = async (path: string | null) => {
    latest.current?.abort();
    const controller = new AbortController();
    latest.current = controller;
    setRunning(controller);
    const next = await onPreview(fromDraft(draft), path, controller.signal);
    if (latest.current !== controller) return;
    setRunning(null);
    if (!(next.ok === false && next.aborted)) setResult(next);
  };

  const host = urlParts(draft.url).host;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t("connection.try.title")}</span>
        {running ? (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => running.abort()}>
            {tCommon("cancel")}
          </Button>
        ) : (
          <Button size="sm" className="ml-auto" disabled={!host} onClick={() => void run(rowsPath)}>
            <Play />
            {t("connection.try.run")}
          </Button>
        )}
      </div>
      {running ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          {t("connection.try.asking", { host })}
        </div>
      ) : !result ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Database className="size-6 opacity-60" />
          {t("connection.try.idle")}
        </div>
      ) : result.ok ? (
        <TryResult
          result={result}
          rowsPath={rowsPath}
          onRowsPath={(path) => {
            onRowsPath(path);
            void run(path);
          }}
        />
      ) : (
        <div className="flex gap-2 rounded-lg border border-border bg-destructive-soft p-3 text-xs">
          <CircleAlert className="size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1">
            <strong className="font-medium">{failureTitle(result.error)}</strong>
            <span className="text-muted-foreground">{errorText(result.error)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
