import { t } from "../../data.i18n";
import type { ConnectionDraft } from "./connection-draft.types";
import { urlParts } from "./url-parts";

/** The request in plain words, and the site in it (shown bold). */
export function connectionSummary(draft: ConnectionDraft): { text: string; site: string } {
  const parts = urlParts(draft.url);
  const site = parts.ok ? parts.host : draft.url.trim() || t("connection.summary.aLink");
  const details: string[] = [];
  const params = parts.params.filter((p) => p.name.trim() !== "");
  if (params.length > 0) {
    const list = params.map((p) => `${p.name} = ${p.value}`).join(", ");
    details.push(t("connection.summary.settings", { count: params.length, list }));
  }
  if (draft.auth !== "none") details.push(t(`connection.summary.auth.${draft.auth}`));
  const headers = draft.headers.filter((h) => h.name.trim() !== "").length;
  if (headers > 0) details.push(t("connection.summary.headers", { count: headers }));
  const tail =
    details.length > 0 ? t("connection.summary.with", { details: details.join(", ") }) : "";
  const where = parts.ok ? `${site}${parts.path === "/" ? "" : parts.path}` : site;
  const text =
    draft.method === "GET"
      ? t("connection.summary.get", { where, tail })
      : t("connection.summary.post", {
          where,
          tail,
          body: t(`connection.summary.body.${draft.bodyKind}`),
        });
  return { text, site };
}
