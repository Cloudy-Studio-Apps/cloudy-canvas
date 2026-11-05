import { t } from "../data.i18n";
import type { SettingSpec } from "../settings";

/** A link's settings, as specs: the generic form, agents and the checks read these. */
export function httpSettings(): SettingSpec[] {
  return [
    { key: "url", kind: "url", label: t("sources.http.url"), required: true },
    {
      key: "method",
      kind: "select",
      label: t("sources.http.method"),
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
      ],
    },
    {
      key: "auth",
      kind: "select",
      label: t("sources.http.auth"),
      options: [
        { value: "none", label: t("sources.http.authNone") },
        { value: "apikey", label: t("sources.http.authApiKey") },
        { value: "bearer", label: t("sources.http.authBearer") },
        { value: "basic", label: t("sources.http.authBasic") },
      ],
    },
    {
      key: "apiKeyName",
      kind: "text",
      label: t("sources.http.apiKeyName"),
      placeholder: "X-API-Key",
    },
    {
      key: "apiKeyIn",
      kind: "select",
      label: t("sources.http.apiKeyIn"),
      options: [
        { value: "header", label: t("sources.http.apiKeyInHeader") },
        { value: "query", label: t("sources.http.apiKeyInQuery") },
      ],
    },
    {
      key: "apiKey",
      kind: "secret",
      label: t("sources.http.apiKey"),
      requiredWhen: { key: "auth", value: "apikey" },
    },
    {
      key: "token",
      kind: "secret",
      label: t("sources.http.token"),
      requiredWhen: { key: "auth", value: "bearer" },
    },
    { key: "username", kind: "text", label: t("sources.http.username") },
    {
      key: "password",
      kind: "secret",
      label: t("sources.http.password"),
      requiredWhen: { key: "auth", value: "basic" },
    },
    { key: "plainHeaders", kind: "pairs", label: t("sources.http.plainHeaders") },
    { key: "headers", kind: "pairs", label: t("sources.http.headers"), secretValues: true },
    {
      key: "bodyKind",
      kind: "select",
      label: t("sources.http.bodyKind"),
      options: [
        { value: "none", label: t("sources.http.bodyNone") },
        { value: "form", label: t("sources.http.bodyForm") },
        { value: "json", label: t("sources.http.bodyJson") },
        { value: "text", label: t("sources.http.bodyText") },
      ],
    },
    { key: "form", kind: "pairs", label: t("sources.http.form") },
    { key: "body", kind: "multiline", label: t("sources.http.body") },
    {
      key: "pagination",
      kind: "select",
      label: t("sources.http.pagination"),
      options: [
        { value: "none", label: t("sources.http.paginationNone") },
        { value: "page", label: t("sources.http.paginationPage") },
        { value: "offset", label: t("sources.http.paginationOffset") },
        { value: "next", label: t("sources.http.paginationNext") },
      ],
    },
    { key: "pageParam", kind: "text", label: t("sources.http.pageParam"), placeholder: "page" },
    { key: "sizeParam", kind: "text", label: t("sources.http.sizeParam"), placeholder: "limit" },
    { key: "firstPage", kind: "number", label: t("sources.http.firstPage"), min: 0, max: 100000 },
    { key: "pageSize", kind: "number", label: t("sources.http.pageSize"), min: 1, max: 100000 },
    { key: "nextPath", kind: "text", label: t("sources.http.nextPath"), placeholder: "links.next" },
    { key: "maxPages", kind: "number", label: t("sources.http.maxPages"), min: 1, max: 500 },
  ];
}
