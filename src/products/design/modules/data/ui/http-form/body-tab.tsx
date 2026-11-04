import { Code, Info, List } from "lucide-react";

import { Button, SegmentedControl, Textarea } from "@shared/ui/kit";
import type { HttpBodyKind } from "../../sources";
import { t } from "../../data.i18n";
import type { ConnectionDraft, JsonMode } from "./connection-draft.types";
import type { ConnectionTabProps } from "./connection-tab.types";
import { jsonToRows, rowsToJson } from "./json-body";
import { JsonCodeEditor } from "./json-code-editor";
import { JsonRowsEditor } from "./json-rows-editor";
import { PairEditor } from "./pair-editor";

const KINDS: readonly HttpBodyKind[] = ["none", "form", "json", "text"];

function kindLabel(kind: HttpBodyKind): string {
  const labels: Record<HttpBodyKind, string> = {
    none: t("sources.http.bodyNone"),
    form: t("sources.http.bodyForm"),
    json: t("sources.http.bodyJson"),
    text: t("sources.http.bodyText"),
  };
  return labels[kind];
}

/** Switching how JSON is edited carries it over; JSON with nested parts stays code. */
function switchJsonMode(draft: ConnectionDraft, mode: JsonMode): ConnectionDraft {
  if (mode === "code") return { ...draft, jsonMode: mode, body: rowsToJson(draft.jsonRows) };
  const rows = jsonToRows(draft.body);
  return rows ? { ...draft, jsonMode: mode, jsonRows: rows } : draft;
}

/**
 * What POST sends: nothing, a form, JSON (built from rows or written) or text. A GET sends no
 * body: it says so, with a button to switch.
 */
export function BodyTab({ draft, onChange }: ConnectionTabProps) {
  if (draft.method === "GET") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-warning-soft p-3 text-xs">
        <Info className="size-4 shrink-0" />
        <span className="flex-1">{t("connection.body.getNote")}</span>
        <Button size="sm" variant="outline" onClick={() => onChange({ ...draft, method: "POST" })}>
          {t("connection.body.usePost")}
        </Button>
      </div>
    );
  }
  const nested = draft.bodyKind === "json" && draft.jsonMode === "code" && !jsonToRows(draft.body);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <SegmentedControl<HttpBodyKind>
          label={t("sources.http.bodyKind")}
          size="sm"
          value={draft.bodyKind}
          onChange={(bodyKind) => onChange({ ...draft, bodyKind })}
          options={KINDS.map((value) => ({ value, label: kindLabel(value) }))}
        />
        {draft.bodyKind === "json" && (
          <SegmentedControl<JsonMode>
            label={t("connection.body.jsonMode")}
            size="sm"
            className="ml-auto"
            value={draft.jsonMode}
            onChange={(mode) => onChange(switchJsonMode(draft, mode))}
            options={[
              {
                value: "rows",
                label: t("connection.body.rows"),
                icon: <List />,
                disabled: nested,
                title: nested ? t("connection.body.nested") : undefined,
              },
              { value: "code", label: t("connection.body.code"), icon: <Code /> },
            ]}
          />
        )}
      </div>
      {draft.bodyKind === "none" && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {t("connection.body.noneHint")}
        </p>
      )}
      {draft.bodyKind === "form" && (
        <>
          <PairEditor
            rows={draft.form}
            nameLabel={t("source.pairName")}
            addPlaceholder={t("connection.body.addValue")}
            onChange={(form) => onChange({ ...draft, form })}
          />
          <p className="text-xs text-muted-foreground">{t("connection.body.formHint")}</p>
        </>
      )}
      {draft.bodyKind === "json" &&
        (draft.jsonMode === "rows" ? (
          <JsonRowsEditor
            rows={draft.jsonRows}
            onChange={(jsonRows) => onChange({ ...draft, jsonRows })}
          />
        ) : (
          <JsonCodeEditor value={draft.body} onChange={(body) => onChange({ ...draft, body })} />
        ))}
      {draft.bodyKind === "text" && (
        <Textarea
          aria-label={t("sources.http.body")}
          value={draft.body}
          spellCheck={false}
          placeholder={t("connection.body.textPlaceholder")}
          onChange={(event) => onChange({ ...draft, body: event.target.value })}
          className="min-h-36 font-mono text-xs"
        />
      )}
    </div>
  );
}
