import { Field, Input, NumberInput, SegmentedControl } from "@shared/ui/kit";
import type { HttpPagination } from "../../sources";
import { DEFAULT_MAX_PAGES } from "../../sources";
import { t } from "../../data.i18n";
import type { ConnectionTabProps } from "./connection-tab.types";

const SIZE_EXAMPLE = "limit";
const MODES: readonly HttpPagination[] = ["none", "page", "offset", "next"];
const MODE_LABELS: Record<
  HttpPagination,
  "paginationNone" | "paginationPage" | "paginationOffset" | "paginationNext"
> = {
  none: "paginationNone",
  page: "paginationPage",
  offset: "paginationOffset",
  next: "paginationNext",
};

/**
 * Pages: how a site that gives its rows a few at a time hands out the rest, showing only the
 * settings the chosen way reads.
 */
export function PagesTab({ draft, onChange }: ConnectionTabProps) {
  const mode = draft.pagination;
  const paged = mode !== "none";
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{t("connection.pages.intro")}</p>
      <SegmentedControl<HttpPagination>
        label={t("sources.http.pagination")}
        size="sm"
        value={mode}
        onChange={(pagination) => onChange({ ...draft, pagination })}
        options={MODES.map((value) => ({
          value,
          label: t(`sources.http.${MODE_LABELS[value]}`),
        }))}
      />
      {paged && (
        <p className="text-xs text-muted-foreground">{t(`connection.pages.${mode}Hint`)}</p>
      )}
      {(mode === "page" || mode === "offset") && (
        <div className="grid grid-cols-2 gap-2.5">
          <Field
            label={t("sources.http.pageParam")}
            hint={t(
              mode === "page"
                ? "connection.pages.pageParamHint"
                : "connection.pages.offsetParamHint",
            )}
          >
            {(id) => (
              <Input
                id={id}
                value={draft.pageParam}
                placeholder={mode === "page" ? "page" : "offset"}
                spellCheck={false}
                onChange={(event) => onChange({ ...draft, pageParam: event.target.value })}
                className="h-8 font-mono text-xs"
              />
            )}
          </Field>
          {mode === "offset" && (
            <Field label={t("sources.http.sizeParam")} hint={t("connection.pages.sizeParamHint")}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.sizeParam}
                  placeholder={SIZE_EXAMPLE}
                  spellCheck={false}
                  onChange={(event) => onChange({ ...draft, sizeParam: event.target.value })}
                  className="h-8 font-mono text-xs"
                />
              )}
            </Field>
          )}
        </div>
      )}
      {mode === "offset" && (
        <Field label={t("sources.http.pageSize")}>
          <NumberInput
            label={t("sources.http.pageSize")}
            value={draft.pageSize}
            min={1}
            max={100000}
            decimals={0}
            onChange={(pageSize, info) => info.done && onChange({ ...draft, pageSize })}
          />
        </Field>
      )}
      {mode === "next" && (
        <Field label={t("sources.http.nextPath")} hint={t("connection.pages.nextPathHint")}>
          {(id) => (
            <Input
              id={id}
              value={draft.nextPath}
              placeholder="links.next"
              spellCheck={false}
              onChange={(event) => onChange({ ...draft, nextPath: event.target.value })}
              className="h-8 font-mono text-xs"
            />
          )}
        </Field>
      )}
      {paged && (
        <Field label={t("sources.http.maxPages")} hint={t("connection.pages.maxHint")}>
          <NumberInput
            label={t("sources.http.maxPages")}
            value={draft.maxPages}
            min={1}
            max={500}
            decimals={0}
            placeholder={String(DEFAULT_MAX_PAGES)}
            onChange={(maxPages, info) => info.done && onChange({ ...draft, maxPages })}
          />
        </Field>
      )}
    </div>
  );
}
