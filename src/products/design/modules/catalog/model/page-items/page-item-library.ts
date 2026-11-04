import type { PageItemDefinition } from "./page-item-definition.types";
import { t } from "../../catalog.i18n";

/** The page items every brochure offers, in the order they're listed. */
export const PAGE_ITEMS: readonly PageItemDefinition[] = [
  {
    id: "page-number",
    label: t("items.pageNumber"),
    template: "{page}",
    anchor: "footer",
    align: "outer",
    fontSize: 10,
  },
  {
    id: "page-of",
    label: t("items.pageOf"),
    template: t("items.pageOfTemplate"),
    anchor: "footer",
    align: "center",
    fontSize: 10,
  },
  {
    id: "title",
    label: t("items.title"),
    template: "{title}",
    anchor: "header",
    align: "inner",
    fontSize: 9,
  },
  {
    id: "section",
    label: t("items.section"),
    template: "{section}",
    anchor: "header",
    align: "outer",
    fontSize: 9,
  },
  {
    id: "folio",
    label: t("items.folio"),
    template: "{section} · {page}",
    anchor: "footer",
    align: "outer",
    fontSize: 10,
  },
  {
    id: "date",
    label: t("items.date"),
    template: "{date}",
    anchor: "footer",
    align: "inner",
    fontSize: 9,
  },
  {
    id: "toc",
    label: t("items.toc"),
    template: "{toc}",
    anchor: "body",
    align: "outer",
    fontSize: 12,
  },
];
