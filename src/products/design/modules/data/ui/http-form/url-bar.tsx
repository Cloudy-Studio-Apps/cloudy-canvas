import { Field, Input, SegmentedControl } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { ConnectionTabProps } from "./connection-tab.types";
import { urlParts } from "./url-parts";

/** The link and its method (GET reads, POST sends a body), with what the method means. */
export function UrlBar({ draft, onChange }: ConnectionTabProps) {
  const parts = urlParts(draft.url);
  const invalid = draft.url.trim() !== "" && !parts.ok;
  return (
    <Field
      label={t("connection.link")}
      hint={draft.method === "GET" ? t("connection.getHint") : t("connection.postHint")}
      error={invalid ? t("connection.badLink") : undefined}
    >
      {(id) => (
        <div className="flex gap-1.5">
          <SegmentedControl<"GET" | "POST">
            label={t("sources.http.method")}
            value={draft.method}
            onChange={(method) => onChange({ ...draft, method })}
            options={[
              { value: "GET", label: "GET", title: t("connection.getHint") },
              { value: "POST", label: "POST", title: t("connection.postHint") },
            ]}
          />
          <Input
            id={id}
            type="url"
            value={draft.url}
            spellCheck={false}
            placeholder="https://"
            aria-invalid={invalid}
            onChange={(event) => {
              const url = event.target.value;
              const next = urlParts(url);
              onChange({ ...draft, url, params: next.ok ? next.params : draft.params });
            }}
            className="h-8 font-mono text-xs"
          />
        </div>
      )}
    </Field>
  );
}
